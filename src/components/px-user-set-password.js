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
            fallbackButtonText: this._t('Password reset'),
            cssUrl: this.cssUrl,
            labels: {
                buttonText: this._t('Password reset'),
                passwordOne: this._t('Password'),
                passwordTwo: this._t('Password confirmation'),
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
        return 'px-user-set-password';
    }
}
