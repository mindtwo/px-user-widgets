import { PxUserBaseWidget } from '../base/px-user-base-widget';

export class PxUserEipConfig extends PxUserBaseWidget {
    static widgetName = 'eip-config';

    /**
     * Configure the widget with the necessary options.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLogin
     */
    configureWidget(config) {
        // Get the token from config
        config.token = this.config('token');

        config.onSuccess = (response) => {};

        return config;
    }

    /**
     * Handle success
     *
     * @param response
     */
    showSuccess(response) {
        const data = response.data ?? {};

        if (data.success) {
            // Hide the error message if it was previously shown
            this.toggleMessageElement('error', false);

            this.displayMessage('success', data.message);

            window.dispatchEvent(
                new CustomEvent('px-user-eip-config-success', {
                    detail: response,
                }),
            );
        }
    }
}
