import { PxUserBaseWidget } from '../base/px-user-base-widget';

export class PxUserActivateUserAndLogin extends PxUserBaseWidget {
    static widgetName = 'activate-user-login';

    successEventName = 'login';

    /**
     * Mount iframe
     */
    mountIFrame() {
        const fallbackTargetUrl = `${this.appUrl}/api/v1/activate-user-and-login`;

        this.module.showActivateUserLoginForm({
            token: this.token,
            showPasswordRules: true,
            icons: {
                togglePassword: {
                    passwordOne: true,
                    passwordTwo: true,
                },
            },
        });
    }
}
