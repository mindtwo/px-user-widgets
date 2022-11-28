import {UserComponent} from './user-component';

export class PxUserLogin extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v2/login`;

        this.module.showLoginForm({
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: this._t('Login'),
            cssUrl: this.cssUrl,
            labels: {
                buttonText: this._t('Login'),
                username: this._t('Email'),
                password: this._t('Password'),
            },
            onSuccess: (response) => this.login(response),
            onError: (response) => this.handleError(response),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
    getContainerId() {
        return 'px-user-login';
    }

    /**
     * Login user on success
     *
     * @param response
     */
    login(response) {
        // const url = `${this.appUrl}/api/v2/login`;

        const data = response.response;

        window.dispatchEvent(new CustomEvent('px-user-loggedIn', { detail: data }));

        // this.request(url, data).then(async (res) => {
        //     const json = await res.json();
        //     if (json.success && !this.external) {
        //         location.reload();
        //         return;
        //     }

        //     if (json.success && this.external) {
        //         // appAuth().setTokenData(json);

        //         window.dispatchEvent(new Event('px-user-loggedIn'));
        //     }
        // });
    }
}
