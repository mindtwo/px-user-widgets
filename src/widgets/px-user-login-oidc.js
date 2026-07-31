import { PxUserBaseWidget } from '../base/px-user-base-widget.js';
import {
    DEFAULT_CHALLENGE_KEY,
    DEFAULT_STATE_KEY,
    DEFAULT_VERIFIER_KEY,
    challengeFromVerifier,
    generatePkce,
    readPkce,
    storePkce,
} from '../helper/pkce.js';
import {
    DEFAULT_IMPERSONATION_KEY,
    DEFAULT_PENDING_REQUEST_KEY,
    authorizeRequestParamNames,
    clearPendingAuthorize,
    isAuthorizeRequest,
    isOidcReturn,
    readAuthorizeRequestFromUrl,
    readImpersonationKey,
    readPendingAuthorize,
    storeImpersonationKey,
    storePendingAuthorize,
    stripUrlParams,
} from '../helper/oidc-flow.js';

export class PxUserLoginOidc extends PxUserBaseWidget {
    static widgetName = 'login-oidc';

    successEventName = 'login';

    static showSuccessMessage = false;

    _generatedChallenge = null;
    _generatedState = null;

    /**
     * The authorization request we are logging the user in *for*, when that
     * request belongs to someone else (an external app sending the user here).
     * @type {{params: Object, extra?: Object}|null}
     */
    _pendingRequest = null;

    _impersonationKey = null;

    /**
     * Resolve the flow context, then hand over to the host script.
     *
     * Everything the host script needs is resolved from config rather than
     * from the URL, because the URL does not survive the two redirects this
     * flow can take: the `/sso/init` bounce (which discards the whole config
     * and reloads the page) and the EIP round-trip (which comes back with the
     * identity provider's own `code`/`state` and nothing else).
     */
    async mountIFrame() {
        this.resolveImpersonationKey();

        await this.resolveAuthorizeContext();

        super.mountIFrame();
    }

    /**
     * Decide which flow mode we are in and prepare accordingly.
     *
     * 1. The URL carries an authorization request → capture, persist, strip.
     * 2. We are resuming a handshake → replay what was captured earlier.
     * 3. Fresh visit → generate PKCE for a login of our own.
     */
    async resolveAuthorizeContext() {
        const search = window.location?.search ?? '';

        // (1) An external app sent the user here to log in. The URL is the
        // live request, so it wins over any statically configured value —
        // this mirrors the host script, which overwrites its config from the
        // URL unconditionally.
        if (isAuthorizeRequest(search)) {
            this.captureAuthorizeRequest(search);
            return;
        }

        // (2) A later leg of a flow that started earlier: back from EIP, or
        // back from the host script's `/sso/init` bounce.
        if (this.isResumingHandshake(search)) {
            const pending = readPendingAuthorize({
                key: this.pendingRequestStorageKey,
            });

            if (pending) {
                this._pendingRequest = pending;
                this.debugLog(
                    'resolveAuthorizeContext',
                    'replaying pending authorize request',
                    pending,
                );
                return;
            }

            if (this.config('codeChallenge')) {
                return;
            }

            // Restore the verifier/state this request was bound to —
            // regenerating here would guarantee a PKCE/state mismatch.
            await this.restoreOwnPkce();
            return;
        }

        // (3) A fresh visit. Any pending request still around belongs to a
        // flow that has either finished or been abandoned, and must not
        // hijack this login — the user would end up back at the external app.
        clearPendingAuthorize({ key: this.pendingRequestStorageKey });

        if (this.config('codeChallenge')) {
            return;
        }

        await this.generateOwnPkce();
    }

    /**
     * Whether this mount continues a flow that started on an earlier page
     * load, rather than beginning a new one.
     *
     * `ssoSessionToken` marks the return from the host script's `/sso/init`
     * POST-redirect. It is still in the URL at this point — `initSsoSession`
     * strips it later, after we have run.
     *
     * @param {string} search
     * @return {boolean}
     */
    isResumingHandshake(search) {
        const params = new URLSearchParams(search);

        return (
            isOidcReturn(params) ||
            params.has('ssoSessionToken') ||
            params.has('ssoSessionTokenError')
        );
    }

    /**
     * Generate and persist a fresh PKCE pair + state.
     */
    async generateOwnPkce() {
        const pkce = await generatePkce();

        storePkce(pkce, {
            verifierKey: this.verifierStorageKey,
            stateKey: this.stateStorageKey,
            challengeKey: this.challengeStorageKey,
        });

        this._generatedChallenge = pkce.challenge;
        this._generatedState = pkce.state;
    }

    /**
     * Take the authorization request out of the URL and into sessionStorage.
     *
     * Stripping is what makes the external-app flow survive an EIP login: the
     * host script reads a bare `state` out of the URL and forwards it as the
     * *EIP* state, so leaving the external app's `state` in place binds the
     * EIP request to the wrong value and the return leg fails validation.
     *
     * @param {string} search
     */
    captureAuthorizeRequest(search) {
        const request = readAuthorizeRequestFromUrl(search);

        this.warnOnSuspiciousRedirectUri(request.params.redirect_uri);

        storePendingAuthorize(request, {
            key: this.pendingRequestStorageKey,
        });

        this._pendingRequest = request;

        if (this.configBool('keepAuthorizeParamsInUrl')) {
            return;
        }

        stripUrlParams(authorizeRequestParamNames());

        this.debugLog(
            'captureAuthorizeRequest',
            'captured authorize request and cleaned the URL',
            request,
        );
    }

    /**
     * Restore the verifier/state/challenge of our own in-flight request.
     *
     * The challenge is only persisted since 3.1 — derive it from the verifier
     * when an older session is still in play, so the re-issued authorization
     * request never goes out without one.
     */
    async restoreOwnPkce() {
        const stored = readPkce({
            verifierKey: this.verifierStorageKey,
            stateKey: this.stateStorageKey,
            challengeKey: this.challengeStorageKey,
            consume: false,
        });

        // Nothing to restore — a different tab, or storage was cleared.
        // Starting over is better than issuing a request with no challenge.
        if (!stored.verifier) {
            await this.generateOwnPkce();
            return;
        }

        this._generatedState = stored.state;
        this._generatedChallenge =
            stored.challenge ?? (await challengeFromVerifier(stored.verifier));
    }

    /**
     * Resolve the impersonation key, preferring an explicit config value,
     * then the URL, then a key captured on an earlier leg of this flow.
     *
     * The host script reads `impersonation_key` from the live URL at mount
     * time, but the first mount is regularly spent on the `/sso/init` bounce —
     * which discards the config and reloads the page. Persisting the key here
     * is what makes impersonation work on the first attempt instead of the
     * second.
     */
    resolveImpersonationKey() {
        const configured = this.config('impersonationKey');

        if (configured) {
            this._impersonationKey = configured;
            return;
        }

        const params = new URLSearchParams(window.location?.search ?? '');
        const fromUrl = params.get('impersonation_key');

        if (fromUrl) {
            storeImpersonationKey(fromUrl, {
                key: this.impersonationStorageKey,
            });

            this._impersonationKey = fromUrl;

            // An impersonation key is a bearer credential: get it out of the
            // address bar, the history entry and any outgoing `Referer`.
            stripUrlParams(['impersonation_key']);

            return;
        }

        this._impersonationKey = readImpersonationKey({
            key: this.impersonationStorageKey,
        });
    }

    /**
     * The host script accepts any `redirect_uri` and lets the IdP reject it,
     * which surfaces as an opaque client validation error. Say something
     * useful instead.
     *
     * @param {string|undefined} redirectUri
     */
    warnOnSuspiciousRedirectUri(redirectUri) {
        if (!redirectUri) {
            return;
        }

        try {
            const url = new URL(redirectUri);

            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error('unsupported protocol');
            }
        } catch {
            this.warn(
                `authorize request carries a redirect_uri that is not an absolute http(s) URL ("${redirectUri}") — the identity provider will likely reject it`,
            );
        }
    }

    /**
     * Configure the OIDC widget per the Authorization Code + PKCE flow.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLoginOidc
     */
    configureWidget(config) {
        config.icons = {
            togglePassword: {
                password: true,
            },
        };

        if (this._pendingRequest) {
            this.applyPendingRequest(config);
        } else {
            this.applyOwnRequest(config);
        }

        if (this._impersonationKey) {
            // The host script only overwrites this when the URL still carries
            // the key — which it no longer does, so ours survives.
            config.impersonationKey = this._impersonationKey;
        }

        const logoUrl = this.config('logoUrl');
        if (logoUrl) {
            config.logo_url = logoUrl;
        }

        const faviconUrl = this.config('faviconUrl');
        if (faviconUrl) {
            config.favicon_url = faviconUrl;
        }

        const formTitle = this.config('formTitle');
        if (formTitle) {
            config.form_title = formTitle;
        }

        const showSpinner = this.config('showSpinner');
        if (showSpinner !== undefined) {
            config.show_spinner = this.configBool('showSpinner');
        }

        if (this.configBool('showLoginWithEip')) {
            config.showLoginWithEip = true;
            config.eipLoginRedirectUri = this.config(
                'eipLoginRedirectUri',
                this.getDefaultRedirectUri(),
            );
        }

        return config;
    }

    /**
     * Replay an authorization request that belongs to another app.
     *
     * Nothing here is ours: the `state` is the external app's CSRF token and
     * the `code_challenge` is bound to a verifier only that app holds. We
     * forward the request verbatim and never touch our own PKCE storage.
     *
     * @param {*} config
     */
    applyPendingRequest(config) {
        const { params } = this._pendingRequest;

        config.response_type = params.response_type ?? 'code';
        config.client_id = params.client_id;
        config.redirect_uri = params.redirect_uri;
        config.scope = params.scope || this.config('scope', 'openid');

        if (params.state) {
            config.state = params.state;
        }

        if (params.code_challenge) {
            config.code_challenge = params.code_challenge;
            config.code_challenge_method =
                params.code_challenge_method ?? 'S256';
        }

        const prompt =
            this._pendingRequest.extra?.prompt ?? this.config('prompt');
        if (prompt) {
            config.prompt = prompt;
        }
    }

    /**
     * Configure our own login request.
     *
     * @param {*} config
     */
    applyOwnRequest(config) {
        config.response_type = this.config('responseType', 'code');
        config.client_id = this.config('clientId');
        config.redirect_uri = this.config(
            'redirectUri',
            this.getDefaultRedirectUri(),
        );

        config.scope = this.config('scope', 'openid');

        const codeChallenge =
            this.config('codeChallenge') ?? this._generatedChallenge;

        // Never send a placeholder: an absent challenge is serialised as the
        // literal string "null" and silently disables PKCE.
        if (codeChallenge) {
            config.code_challenge = codeChallenge;
            config.code_challenge_method = this.config(
                'codeChallengeMethod',
                'S256',
            );
        }

        const state = this.config('state') ?? this._generatedState;
        if (state) {
            config.state = state;
        }

        const prompt = this.config('prompt');
        if (prompt) {
            config.prompt = prompt;
        }
    }

    /**
     * Whether this mount is completing an authorization request that belongs
     * to another app.
     *
     * @return {boolean}
     */
    get isProxyingAuthorizeRequest() {
        return this._pendingRequest !== null;
    }

    getDefaultRedirectUri() {
        if (!window.location?.origin) {
            return '';
        }

        return `${window.location.origin}`;
    }

    get verifierStorageKey() {
        return this.config('verifierStorageKey', DEFAULT_VERIFIER_KEY);
    }

    get stateStorageKey() {
        return this.config('stateStorageKey', DEFAULT_STATE_KEY);
    }

    get challengeStorageKey() {
        return this.config('challengeStorageKey', DEFAULT_CHALLENGE_KEY);
    }

    get pendingRequestStorageKey() {
        return this.config(
            'pendingRequestStorageKey',
            DEFAULT_PENDING_REQUEST_KEY,
        );
    }

    get impersonationStorageKey() {
        return this.config(
            'impersonationStorageKey',
            DEFAULT_IMPERSONATION_KEY,
        );
    }

    /**
     * Read the persisted verifier + state from sessionStorage. Convenience
     * wrapper around the `readPkce` helper, kept on the class for callers
     * that already import the widget.
     *
     * @param {Parameters<typeof readPkce>[0]} [options]
     * @return {{verifier: string|null, state: string|null, challenge: string|null}}
     */
    static readPkce(options) {
        return readPkce(options);
    }
}
