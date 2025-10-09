import { PxUserBaseWidget } from '../base/px-user-base-widget';

export class PxUserSetPasswordByForgotPasswordCodeAndLogin extends PxUserBaseWidget {
    static widgetName = 'password-set-by-forgot-password-code-login';

    successEventName = 'login';

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
        config.icons = {
            togglePassword: {
                passwordOne: true,
                passwordTwo: true,
            },
        };

        return config;
    }
}
