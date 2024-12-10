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
            conf.state = '1234567890';
            conf.client_id = 'abc123';
            conf.eipLoginRedirectUri = this.getRedirectUri();
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

    getRedirectUri() {
        if (!window.location?.origin) {
            return '';
        }

        return window.location.origin;
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
