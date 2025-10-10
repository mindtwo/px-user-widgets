import { PxUserBaseWidget } from '../base/px-user-base-widget.js';

export class PxUserLogin extends PxUserBaseWidget {
    static widgetName = 'login';

    // The name of the event to emit on successful login
    successEventName = 'login';

    /**
     * Show success message after successful operation.
     */
    static showSuccessMessage = false;

    /**
     * Configure the widget with the necessary options.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLogin
     */
    configureWidget(config) {
        // Always show the icons
        config.icons = {
            togglePassword: {
                password: true,
            },
        };

        // If the widget is configured to show login with EIP, add the necessary configuration
        if (this.config('showLoginWithEip', false)) {
            config.showLoginWithEip = true;
            config.state = '1234567890'; // Example state, should be replaced with actual logic
            config.client_id = 'abc123'; // Example client ID, should be replaced with actual logic
            config.eipLoginRedirectUri = this.getRedirectUri();
        }

        return config;
    }

    getRedirectUri() {
        if (!window.location?.origin) {
            return '';
        }

        return window.location.origin;
    }
}
