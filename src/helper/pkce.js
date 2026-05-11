export const DEFAULT_VERIFIER_KEY = 'px-oidc-verifier';
export const DEFAULT_STATE_KEY = 'px-oidc-state';

/**
 * Generate a PKCE verifier/challenge pair and a random state value.
 *
 * @return {Promise<{verifier: string, challenge: string, state: string}>}
 */
export async function generatePkce() {
    const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

    const verifier = base64UrlEncode(rand(32));
    const state = base64UrlEncode(rand(16));

    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier),
    );

    return {
        verifier,
        state,
        challenge: base64UrlEncode(new Uint8Array(digest)),
    };
}

/**
 * Persist verifier + state in sessionStorage so the callback page can
 * complete the token exchange.
 *
 * @param {{verifier: string, state: string}} pkce
 * @param {{verifierKey?: string, stateKey?: string}} [options]
 */
export function storePkce(
    { verifier, state },
    { verifierKey = DEFAULT_VERIFIER_KEY, stateKey = DEFAULT_STATE_KEY } = {},
) {
    sessionStorage.setItem(verifierKey, verifier);
    sessionStorage.setItem(stateKey, state);
}

/**
 * Read the persisted verifier + state from sessionStorage. Use this on
 * your OIDC callback page to complete the token exchange.
 *
 * @param {{verifierKey?: string, stateKey?: string, consume?: boolean}} [options]
 * @return {{verifier: string|null, state: string|null}}
 */
export function readPkce({
    verifierKey = DEFAULT_VERIFIER_KEY,
    stateKey = DEFAULT_STATE_KEY,
    consume = true,
} = {}) {
    const verifier = sessionStorage.getItem(verifierKey);
    const state = sessionStorage.getItem(stateKey);

    if (consume) {
        sessionStorage.removeItem(verifierKey);
        sessionStorage.removeItem(stateKey);
    }

    return { verifier, state };
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
