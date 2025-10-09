import { PxUserBaseWidget } from '../base/px-user-base-widget';

export class PxUserActivateUserWithActivationCode extends PxUserBaseWidget {
    static widgetName = 'activate-user-by-activation-code';

    successEventName = 'activated';

    /**
     * Mount iframe
     */
    mountIFrame() {
        this.module.showActivateUserByActivationCodeForm({
            token: this.token,
            showPasswordRules: true,

            // TODO: displat message
            onSuccessActivationCode: (response) =>
                this.handleSuccess(response, false),
            // TODO: displat error message
            onErrorActivationCode: (error) => this.handleError(error),
        });
    }
}
