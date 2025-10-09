import { UserComponent } from './user-component';

export class PxUserEipConfig extends UserComponent {
    /**
     * Mount iframe
     */
    mountIFrame() {
        const conf = {
            token: this.token,
            onSuccess: (response) => this.showSuccess(response),
        };

        if (Object.keys(this.labels).length > 0) {
            conf.labels = this.labels;
        }

        this.module.showEipConfigForm(conf);
    }

    /**
     * Handle success
     *
     * @param response
     */
    showSuccess(response) {
        this.handleSuccess(
            response.data,
            response.source === 'save' && response.data.success,
        );

        window.dispatchEvent(
            new CustomEvent('px-user-eip-config-success', {
                detail: response,
            }),
        );
    }
}
