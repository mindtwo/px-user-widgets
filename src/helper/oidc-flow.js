/**
 * Flow-state helpers for the OIDC widget.
 *
 * The PX-User host script (`widget.js`) resolves the OIDC authorization
 * request from `window.location.search` at mount time, and throws that
 * resolved config away again whenever `initSsoSession()` decides it has to
 * bounce through `/sso/init` first. Anything that only lives in the URL is
 * therefore lost across the SSO bounce and across the EIP (Entra ID)
 * round-trip.
 *
 * These helpers let the widget capture such parameters **once**, persist them
 * in sessionStorage, strip them from the URL, and replay them from config on
 * every later mount.
 */

export const DEFAULT_PENDING_REQUEST_KEY = 'px-oidc-pending-authorize';
export const DEFAULT_IMPERSONATION_KEY = 'px-oidc-impersonation-key';

/** Pending authorize requests are short-lived — a login the user abandoned
 * must not hijack the next one. */
export const DEFAULT_PENDING_REQUEST_TTL = 10 * 60 * 1000;
export const DEFAULT_IMPERSONATION_TTL = 5 * 60 * 1000;

/**
 * Parameters of an OAuth / OIDC authorization request that the host script
 * forwards to the widget iframe.
 */
const AUTHORIZE_PARAMS = [
    'response_type',
    'client_id',
    'redirect_uri',
    'scope',
    'state',
    'code_challenge',
    'code_challenge_method',
];

/**
 * Parameters that belong to the authorization request but that the host
 * script does not forward. Captured so stripping the URL stays lossless and
 * a later version can forward them without another migration.
 */
const AUTHORIZE_EXTRA_PARAMS = [
    'nonce',
    'prompt',
    'response_mode',
    'login_hint',
];

/**
 * Coerce the argument into URLSearchParams. Defaults to the current URL.
 *
 * @param {string|URLSearchParams} [search]
 * @return {URLSearchParams}
 */
function toParams(search) {
    if (search instanceof URLSearchParams) {
        return search;
    }

    if (typeof search === 'string') {
        return new URLSearchParams(search);
    }

    return new URLSearchParams(globalThis.location?.search ?? '');
}

/**
 * True when the URL carries an OAuth / OIDC authorization request — e.g. an
 * external app sending the user here to log in.
 *
 * Deliberately mirrors the host script's own test
 * (`conditionallyConvertToSsoProvider`: `response_type === 'code'`) so the
 * widget and the host script can never disagree about which mode we are in.
 *
 * @param {string|URLSearchParams} [search]
 * @return {boolean}
 */
export function isAuthorizeRequest(search) {
    const params = toParams(search);

    return (
        params.get('response_type') === 'code' &&
        Boolean(params.get('client_id')) &&
        Boolean(params.get('redirect_uri'))
    );
}

/**
 * True when the URL looks like a redirect *back* from an authorization
 * server — the EIP (Entra ID) bounce or an OIDC error redirect.
 *
 * Note `state` alone is not a marker: an authorization *request* carries a
 * `state` too, and treating that as a return is how the external-app flow
 * used to pick up a stale verifier.
 *
 * @param {string|URLSearchParams} [search]
 * @return {boolean}
 */
export function isOidcReturn(search) {
    const params = toParams(search);

    if (isAuthorizeRequest(params)) {
        return false;
    }

    return params.has('code') || params.has('error');
}

/**
 * True while any PX-User handshake is in flight: an authorization request, a
 * redirect back from the IdP, or an impersonation entry URL.
 *
 * Host apps should gate their access/redirect middleware on this instead of
 * pattern-matching query parameters themselves — a redirect in the middle of
 * the handshake drops the parameters and stalls the flow.
 *
 * @param {string|URLSearchParams} [search]
 * @return {boolean}
 */
export function isOidcHandshakeInFlight(search) {
    const params = toParams(search);

    return (
        isAuthorizeRequest(params) ||
        isOidcReturn(params) ||
        params.has('impersonation_key')
    );
}

/**
 * Read the authorization request from the URL.
 *
 * @param {string|URLSearchParams} [search]
 * @return {{params: Object<string, string>, extra: Object<string, string>}}
 */
export function readAuthorizeRequestFromUrl(search) {
    const params = toParams(search);

    const collect = (names) =>
        names.reduce((carry, name) => {
            const value = params.get(name);

            if (value !== null) {
                carry[name] = value;
            }

            return carry;
        }, {});

    return {
        params: collect(AUTHORIZE_PARAMS),
        extra: collect(AUTHORIZE_EXTRA_PARAMS),
    };
}

/**
 * Every query parameter that belongs to an authorization request.
 *
 * @return {string[]}
 */
export function authorizeRequestParamNames() {
    return [...AUTHORIZE_PARAMS, ...AUTHORIZE_EXTRA_PARAMS];
}

/**
 * Remove query parameters from the current URL without navigating.
 *
 * The host script does the same for `ssoSessionToken`
 * (`initSsoSession` → `history.replaceState`), so this is consistent with
 * how the URL is already being managed.
 *
 * @param {string[]} names
 * @return {boolean} whether the URL was rewritten
 */
export function stripUrlParams(names) {
    if (!globalThis.location?.href || !globalThis.history?.replaceState) {
        return false;
    }

    const url = new URL(globalThis.location.href);
    let changed = false;

    for (const name of names) {
        if (url.searchParams.has(name)) {
            url.searchParams.delete(name);
            changed = true;
        }
    }

    if (!changed) {
        return false;
    }

    globalThis.history.replaceState(
        globalThis.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
    );

    return true;
}

/**
 * sessionStorage can throw (Safari private mode, disabled storage) — never
 * let that take the widget down with it.
 *
 * @param {Function} fn
 * @param {*} [fallback]
 * @return {*}
 */
function safely(fn, fallback = null) {
    try {
        return fn();
    } catch {
        return fallback;
    }
}

/**
 * Persist a value with a creation timestamp so it can expire.
 *
 * @param {string} key
 * @param {*} value
 */
function writeRecord(key, value) {
    safely(() =>
        sessionStorage.setItem(
            key,
            JSON.stringify({ value, createdAt: Date.now() }),
        ),
    );
}

/**
 * Read a value written by `writeRecord`, honouring the TTL.
 *
 * @param {string} key
 * @param {{ttl?: number, consume?: boolean}} [options]
 * @return {*} the stored value, or null when missing/expired/unreadable
 */
function readRecord(key, { ttl, consume = false } = {}) {
    const raw = safely(() => sessionStorage.getItem(key));

    if (!raw) {
        return null;
    }

    const record = safely(() => JSON.parse(raw));

    // Written by an older version, or corrupted — treat as absent and clean up.
    if (!record || typeof record !== 'object' || !('value' in record)) {
        safely(() => sessionStorage.removeItem(key));
        return null;
    }

    const expired =
        typeof ttl === 'number' &&
        typeof record.createdAt === 'number' &&
        Date.now() - record.createdAt > ttl;

    if (expired) {
        safely(() => sessionStorage.removeItem(key));
        return null;
    }

    if (consume) {
        safely(() => sessionStorage.removeItem(key));
    }

    return record.value;
}

/**
 * Persist an authorization request so it survives the `/sso/init` bounce and
 * the EIP round-trip.
 *
 * @param {{params: Object, extra?: Object}} request
 * @param {{key?: string}} [options]
 */
export function storePendingAuthorize(
    request,
    { key = DEFAULT_PENDING_REQUEST_KEY } = {},
) {
    writeRecord(key, request);
}

/**
 * Read the persisted authorization request.
 *
 * @param {{key?: string, ttl?: number, consume?: boolean}} [options]
 * @return {{params: Object, extra?: Object}|null}
 */
export function readPendingAuthorize({
    key = DEFAULT_PENDING_REQUEST_KEY,
    ttl = DEFAULT_PENDING_REQUEST_TTL,
    consume = false,
} = {}) {
    const value = readRecord(key, { ttl, consume });

    if (!value || typeof value !== 'object' || !value.params) {
        return null;
    }

    return value;
}

/**
 * @param {{key?: string, ttl?: number}} [options]
 * @return {boolean}
 */
export function hasPendingAuthorize(options) {
    return readPendingAuthorize(options) !== null;
}

/**
 * Drop the persisted authorization request. Call this once the handshake has
 * completed (e.g. on your callback page).
 *
 * @param {{key?: string}} [options]
 */
export function clearPendingAuthorize({
    key = DEFAULT_PENDING_REQUEST_KEY,
} = {}) {
    safely(() => sessionStorage.removeItem(key));
}

/**
 * Persist an impersonation key.
 *
 * @param {string} value
 * @param {{key?: string}} [options]
 */
export function storeImpersonationKey(
    value,
    { key = DEFAULT_IMPERSONATION_KEY } = {},
) {
    writeRecord(key, value);
}

/**
 * Read the persisted impersonation key.
 *
 * @param {{key?: string, ttl?: number, consume?: boolean}} [options]
 * @return {string|null}
 */
export function readImpersonationKey({
    key = DEFAULT_IMPERSONATION_KEY,
    ttl = DEFAULT_IMPERSONATION_TTL,
    consume = false,
} = {}) {
    const value = readRecord(key, { ttl, consume });

    return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * Drop the persisted impersonation key.
 *
 * Worth calling once the impersonated session is established: the key is a
 * bearer credential and it otherwise stays readable for the remainder of its
 * TTL.
 *
 * @param {{key?: string}} [options]
 */
export function clearImpersonationKey({
    key = DEFAULT_IMPERSONATION_KEY,
} = {}) {
    safely(() => sessionStorage.removeItem(key));
}
