import {UserComponent} from './user-component';

export class PxUserActivateUserWithActivationCode extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/activation-code`;

        console.log('fallbackTargetUrl', fallbackTargetUrl);

        this.module.showActivateUserByActivationCodeForm({
            token: this.token,
            showPasswordRules: true,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Activate User',
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.activated(response),
            onError: (error) => this.handleError(error),
            onSuccessActivationCode: (response) => this.handleSuccess(response, false),
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

    /**
     * Login user on success
     *
     * @param response
     */
    activated(response) {
        window.dispatchEvent(new CustomEvent('px-user-activated', {
            detail: response.response
        }));

        this.handleSuccess(response); // remove iframe now
    }
}
