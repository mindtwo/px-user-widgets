import {UserComponent} from './user-component';

export class PxUserAdminLogin extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/admin/login`;

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
            onError: (error) => this.handleError(error),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
     getContainerId() {
        return 'px-user-admin-login';
    }

    /**
     * Login user on success
     *
     * @param response
     */
    login(response) {
        const data = response.response;
        this.request('/admin/login', data).then(async (res) => {
            if (res.redirected) {
                window.location.href = res.url;
            }
        });
    }
}
