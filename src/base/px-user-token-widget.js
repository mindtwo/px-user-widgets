import { PxUserBaseWidget } from './px-user-base-widget.js';

export class PxUserTokenWidget extends PxUserBaseWidget {
    /**
     * Configure the widget with the necessary options.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLogin
     */
    configureWidget(config) {
        // Get the token from config
        const token = this.config('token');

        if (!token) {
            throw new Error(
                `Token is required for ${this.constructor.widgetName}`,
            );
        }

        // Set the token in the config
        config.token = token;

        return config;
    }
}
