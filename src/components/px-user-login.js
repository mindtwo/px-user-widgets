import {UserComponent} from './user-component';

export class PxUserLogin extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v2/login`;

        const conf = {
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Login!',
            icons: {
                togglePassword: {
                    password: true
                }
            },
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.login(response),
            onError: (response) => this.handleError(response),
        };

        if (Object.keys(this.labels).length > 0) {
            conf.labels = this.labels;
        }

        // configure EIP login first step
        if (this.showLoginWithEip) {
            conf.showLoginWithEip = true;
            conf.eipAuthToken = null;
            conf.eipState = null;
            conf.eipLoginRedirectUri = this.getEipRedirectUri();
        }

        // check if EIP redirect params are present
        if (this.hasEipRedirectParams()) {
            const params = this.getEipParams();

            if (params.success) {
                conf.eipAuthToken = params.code;
                conf.eipState = params.state;
            } else {
                this.handleError(params);
                return;
            }
        }

        this.module.showLoginForm(conf);
    }

    /**
     * Get container fallback id
     *
     * @returns {string}
     */
    getContainerId() {
        return 'px-user-login';
    }

    /**
     * Get EIP redirect URI
     *
     * @returns {string|null}
     */
    getEipRedirectUri() {
        if (! this.showLoginWithEip) {
            return null;
        }

        return this.eipLoginRedirectUri ?? window.location.href;
    }

    /**
     * Get whether EIP redirect params are present
     *
     * @returns {boolean}
     */
    hasEipRedirectParams() {
        const search = window?.location?.search;

        if (! search) {
            return false;
        }

        const params = new URLSearchParams(search);

        // code and state or error must be present
        return (params.has('code') && params.has('state')) || params.has('error');
    }

    /**
     * Get EIP params
     * @returns {{success: boolean, code: string, state: string, error: string}}
     */
    getEipParams() {
        const search = window?.location?.search;

        if (! search) {
            return {};
        }

        const params = new URLSearchParams(search);

        const error = params.get('error');

        return {
            success: ! error,
            code: params.get('code'),
            state: params.get('state'),
            error,
        };
    }

    /**
     * Login user on success
     *
     * @param response
     */
    login(response) {
        window.dispatchEvent(new CustomEvent('px-user-loggedIn', {
            detail: response.response
        }));
    }
}
