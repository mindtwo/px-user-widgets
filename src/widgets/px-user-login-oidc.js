import { PxUserBaseWidget } from '../base/px-user-base-widget.js';

const DEFAULT_VERIFIER_KEY = 'px-oidc-verifier';
const DEFAULT_STATE_KEY = 'px-oidc-state';

export class PxUserLoginOidc extends PxUserBaseWidget {
    static widgetName = 'login-oidc';

    successEventName = 'login';

    static showSuccessMessage = false;

    _generatedChallenge = null;
    _generatedState = null;

    /**
     * If no code_challenge was supplied, generate a PKCE pair + state and
     * persist verifier/state in sessionStorage so the callback page can
     * complete the token exchange.
     */
    async mountIFrame() {
        if (!this.config('codeChallenge')) {
            const { verifier, state, challenge } =
                await PxUserLoginOidc.generatePkce();

            sessionStorage.setItem(this.verifierStorageKey, verifier);
            sessionStorage.setItem(this.stateStorageKey, state);

            this._generatedChallenge = challenge;
            this._generatedState = state;
        }

        super.mountIFrame();
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

        config.response_type = this.config('responseType', 'code');
        config.client_id = this.config('clientId');
        config.redirect_uri = this.config('redirectUri', this.getRedirectUri());
        config.code_challenge =
            this.config('codeChallenge') ?? this._generatedChallenge;
        config.code_challenge_method = this.config(
            'codeChallengeMethod',
            'S256',
        );

        const state = this.config('state') ?? this._generatedState;
        if (state) {
            config.state = state;
        }

        config.scope = this.config('scope', 'openid');

        const prompt = this.config('prompt');
        if (prompt) {
            config.prompt = prompt;
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
            config.show_spinner = showSpinner;
        }

        if (this.config('showLoginWithEip', false)) {
            config.showLoginWithEip = true;
            config.eipLoginRedirectUri = this.getRedirectUri();
        }

        return config;
    }

    getRedirectUri() {
        if (!window.location?.origin) {
            return '';
        }

        return `${window.location.origin}/callback`;
    }

    get verifierStorageKey() {
        return this.config('verifierStorageKey', DEFAULT_VERIFIER_KEY);
    }

    get stateStorageKey() {
        return this.config('stateStorageKey', DEFAULT_STATE_KEY);
    }

    /**
     * Generate a PKCE verifier/challenge pair and a random state value.
     *
     * @return {Promise<{verifier: string, challenge: string, state: string}>}
     */
    static async generatePkce() {
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
     * Read the persisted verifier + state from sessionStorage. Use this on
     * your OIDC callback page to complete the token exchange.
     *
     * @param {{verifierKey?: string, stateKey?: string, consume?: boolean}} [options]
     * @return {{verifier: string|null, state: string|null}}
     */
    static readPkce({
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
}

function base64UrlEncode(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
