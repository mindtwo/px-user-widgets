import {UserComponent} from './user-component';

export class PxUserActivateUser extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/doi-activation`;

        this.module.showActivateUserLoginForm({
            token: this.token,
            showPasswordRules: true,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Activate user and login!',
            cssUrl: this.cssUrl,
            icons: {
                togglePassword: {
                    passwordOne: true,
                    passwordTwo: true
                }
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
        return 'px-user-activate-user-and-login';
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
