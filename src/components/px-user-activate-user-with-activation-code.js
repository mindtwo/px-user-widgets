import {UserComponent} from './user-component';

export class PxUserActivateUserWithActivationCode extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/activation-code`;

        this.module.showActivateUserByActivationCodeForm({
            token: this.token,
            showPasswordRules: true,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Activate User',
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.showSuccess(response),
            onError: (error) => this.handleError(error),
            onSuccessActivationCode: (response) => this.showSuccess(response),
            onErrorActivationCode: (error) => this.handleError(error),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
     getContainerId() {
        return 'px-user-activate-user-with-activation-code';
    }
}