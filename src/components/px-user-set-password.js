import {UserComponent} from './user-component';

export class PxUserSetPassword extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/set-password`;

        this.module.showPasswordSetForm({
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
            onSuccess: (response) => this.showSuccess(response),
            onError: (error) => this.handleError(error),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
     getContainerId() {
        return 'px-user-set-password';
    }
}
