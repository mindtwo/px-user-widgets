import {UserComponent} from './user-component';

export class PxUserActivateUser extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/doi-activation`;

        this.module.showActivateUserForm({
            token: this.token,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: this._t('Set password'),
            cssUrl: this.cssUrl,
            labels: {
                buttonText: this._t('Set password'),
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
        return 'px-user-activate-user';
    }
}
