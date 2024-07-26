import {UserComponent} from './user-component';

export class PxUserEipConfig extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v2/eip-config`;

        const conf = {
            token: this.token,
            containerElement: this.containerId,
            fallbackButtonText: 'Save config',
            fallbackTargetUrl,
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.showSuccess(response),
            onError: (error) => this.showError(error),
        };

        if (Object.keys(this.labels).length > 0) {
            conf.labels = this.labels;
        }

        this.module.showEipConfigForm(conf)
    }

    /**
     * Get container fallback id
     *
     * @returns {String}
     */
    getContainerId() {
        return 'px-user-eip-config';
    }

    /**
     * Handle success
     *
     * @param response
     */
    showSuccess(response, removeIFrame = true) {
        this.resetMessages();

        if (response.data.success) {
            // remove iframe
            if (removeIFrame) {
                document.querySelector(`#${this.containerId} .px-user-widget`).remove();
            }

            // set our success message
            this.successMessageElem.textContent = response.data.message;
            this.successMessageElem.style.display = 'block';

            window.dispatchEvent(new CustomEvent('px-user-success', {
                detail: response,
            }));
        }
    }

    /**
     * Handle error
     *
     * @param error
     */
    showError(error) {
        this.resetMessages();

        this.errorMessageElem.textContent = error.data.message;
        this.errorMessageElem.style.display = 'block';
    }
}
