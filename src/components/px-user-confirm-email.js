import {UserComponent} from './user-component';

export class PxUserConfirmEmail extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/confirm-new-email`;

        this.module.showConfirmNewEmailForm({
            token: this.token,
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText: 'Confirm New Email',
            cssUrl: this.cssUrl,
            onSuccess: (response) => {
                if (! response.success) {
                    return this.handleError(response);
                }

                window.dispatchEvent(new CustomEvent('px-user-email-confirmed', {
                    detail: data,
                }));
            },
            onError: (error) => this.handleError(error),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
     getContainerId() {
        return 'px-user-confirm-email';
    }
}
