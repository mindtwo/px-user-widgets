import {UserComponent} from './user-component';

export class PxUserAdminLogin extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/admin/login`;

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

        this.module.showLoginForm(conf);
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

        window.dispatchEvent(new CustomEvent('px-user-adminLoggedIn', { detail: data }));
    }
}
