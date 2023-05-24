import {UserComponent} from './user-component';

export class PxUserActivateUser extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/doi-activation`;

        console.log('fallbackTargetUrl', fallbackTargetUrl);

        this.module.showActivateUserForm({
            token: this.token,
            containerElement: this.containerId,
            fallbackButtonText: 'Set Password!',
            fallbackTargetUrl,
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
        return 'px-user-activate-user';
    }
}
