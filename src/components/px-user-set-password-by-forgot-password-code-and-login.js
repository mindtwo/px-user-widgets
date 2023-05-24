import {UserComponent} from './user-component';

export class PxUserSetPasswordByForgotPasswordCodeAndLogin extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/set-password`;

        console.log('fallbackTargetUrl', fallbackTargetUrl);

        this.module.showPasswordSetByForgotPasswordCodeLoginForm({
            token: this.token,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Reset Password!',
            cssUrl: this.cssUrl,
            icons: {
                togglePassword: {
                    passwordOne: true,
                    passwordTwo: true
                }
            },
            showPasswordRules: true,
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
        return 'px-user-set-password-by-forgot-password-code-and-login';
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
