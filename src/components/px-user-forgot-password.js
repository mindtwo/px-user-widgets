import {UserComponent} from './user-component';

export class PxUserForgotPassword extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/reset-password`;

        console.log('fallbackTargetUrl', fallbackTargetUrl);

        this.module.showPasswordForgotForm({
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Send password reset email!',
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.handleSuccess(response),
            onError: (error) => this.handleError(error),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
     getContainerId() {
        return 'px-user-forgot-password';
    }
}
