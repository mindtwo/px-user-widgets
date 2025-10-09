import { PxUserBaseWidget } from '../base/px-user-base-widget';

export class PxUserActivateUserWithActivationCode extends PxUserBaseWidget {
    static widgetName = 'activate-user-by-activation-code';

    successEventName = 'activated';

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
        config.showPasswordRules = true;

        config.onSuccessActivationCode = (response) =>
            this.displayMessage('success', response.message);

        config.onErrorActivationCode = (error) =>
            this.displayMessage('error', error.message);

        return config;
    }
}
