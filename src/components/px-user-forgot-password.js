import {UserComponent} from './user-component';

export class PxUserForgotPassword extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/reset-password`;

        const conf = {
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Send password reset email!',
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.handleSuccess(response),
            onError: (error) => this.handleError(error),
        };

        if (Object.keys(this.labels).length > 0) {
            conf.labels = this.labels;
        }

        this.module.showPasswordForgotForm(conf);
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
