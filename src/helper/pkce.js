export const DEFAULT_VERIFIER_KEY = 'px-oidc-verifier';
export const DEFAULT_STATE_KEY = 'px-oidc-state';
export const DEFAULT_CHALLENGE_KEY = 'px-oidc-challenge';

/**
 * Derive the PKCE code challenge from a verifier (RFC 7636 §4.2).
 *
 * @param {string} verifier
 * @return {Promise<string>}
 */
export async function challengeFromVerifier(verifier) {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier),
    );

    return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Generate a PKCE verifier/challenge pair and a random state value.
 *
 * @return {Promise<{verifier: string, challenge: string, state: string}>}
 */
export async function generatePkce() {
    const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

    const verifier = base64UrlEncode(rand(32));
    const state = base64UrlEncode(rand(16));

    return {
        verifier,
        state,
        challenge: await challengeFromVerifier(verifier),
    };
}

/**
 * Persist verifier + state + challenge in sessionStorage so the callback page
 * can complete the token exchange.
 *
 * The challenge is persisted because the authorization request may have to be
 * re-issued on a later mount (the EIP bounce returns to this page). Without
 * it the second request would go out with no `code_challenge` at all, while
 * the callback still sends a `code_verifier` — PKCE silently downgraded.
 *
 * @param {{verifier: string, state: string, challenge?: string}} pkce
 * @param {{verifierKey?: string, stateKey?: string, challengeKey?: string}} [options]
 */
export function storePkce(
    { verifier, state, challenge },
    {
        verifierKey = DEFAULT_VERIFIER_KEY,
        stateKey = DEFAULT_STATE_KEY,
        challengeKey = DEFAULT_CHALLENGE_KEY,
    } = {},
) {
    sessionStorage.setItem(verifierKey, verifier);
    sessionStorage.setItem(stateKey, state);

    if (challenge) {
        sessionStorage.setItem(challengeKey, challenge);
    }
}

/**
 * Read the persisted verifier + state + challenge from sessionStorage. Use
 * this on your OIDC callback page to complete the token exchange.
 *
 * @param {{verifierKey?: string, stateKey?: string, challengeKey?: string, consume?: boolean}} [options]
 * @return {{verifier: string|null, state: string|null, challenge: string|null}}
 */
export function readPkce({
    verifierKey = DEFAULT_VERIFIER_KEY,
    stateKey = DEFAULT_STATE_KEY,
    challengeKey = DEFAULT_CHALLENGE_KEY,
    consume = true,
} = {}) {
    const verifier = sessionStorage.getItem(verifierKey);
    const state = sessionStorage.getItem(stateKey);
    const challenge = sessionStorage.getItem(challengeKey);

    if (consume) {
        sessionStorage.removeItem(verifierKey);
        sessionStorage.removeItem(stateKey);
        sessionStorage.removeItem(challengeKey);
    }

    return { verifier, state, challenge };
}

/**
 * Drop the persisted verifier/state/challenge.
 *
 * @param {{verifierKey?: string, stateKey?: string, challengeKey?: string}} [options]
 */
export function clearPkce({
    verifierKey = DEFAULT_VERIFIER_KEY,
    stateKey = DEFAULT_STATE_KEY,
    challengeKey = DEFAULT_CHALLENGE_KEY,
} = {}) {
    sessionStorage.removeItem(verifierKey);
    sessionStorage.removeItem(stateKey);
    sessionStorage.removeItem(challengeKey);
}

/**
 * Base64URL-encode a byte array (RFC 7636).
 *
 * @param {Uint8Array} bytes
 * @return {string}
 */
export function base64UrlEncode(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
