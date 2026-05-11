import { PxUserBaseWidget } from '../base/px-user-base-widget.js';
import {
    DEFAULT_STATE_KEY,
    DEFAULT_VERIFIER_KEY,
    generatePkce,
    readPkce,
    storePkce,
} from '../helper/pkce.js';

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
            const pkce = await generatePkce();

            storePkce(pkce, {
                verifierKey: this.verifierStorageKey,
                stateKey: this.stateStorageKey,
            });

            this._generatedChallenge = pkce.challenge;
            this._generatedState = pkce.state;
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

        config.scope = this.config('scope', 'openid');

        const state = this.config('state') ?? this._generatedState;
        if (state) {
            config.state = state;
        }

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
     * Read the persisted verifier + state from sessionStorage. Convenience
     * wrapper around the `readPkce` helper, kept on the class for callers
     * that already import the widget.
     *
     * @param {Parameters<typeof readPkce>[0]} [options]
     * @return {{verifier: string|null, state: string|null}}
     */
    static readPkce(options) {
        return readPkce(options);
    }
}
