import {UserComponent} from './user-component';

export class PxUserForgotPassword extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/reset-password`;

        this.module.showPasswordForgotForm({
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: this._t('Reset password'),
            cssUrl: this.cssUrl,
            labels: {
                buttonText: this._t('Reset password'),
                email: this._t('Email'),
            },
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
        return 'px-user-forgot-password';
    }
}
