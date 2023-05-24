import {UserComponent} from './user-component';

export class PxUserActivateUserWithActivationCode extends UserComponent {
    /**
     * Login user on success
     *
     * @param response
     */
    activated(response) {
        window.dispatchEvent(new CustomEvent('px-user-activated', {
            detail: response.response
        }));

        this.handleSuccess(response); // remove iframe now
    }

    get config() {
        return {
            ...super.config,
            showPasswordRules: true,
            fallbackButtonText: 'Activate User',
            token: this.token,
            onSuccess: (response) => this.activated(response),
            onSuccessActivationCode: (response) => this.handleSuccess(response, false),
            onErrorActivationCode: (error) => this.handleError(error),
        }
    }

    get widget() {
        return 'showActivateUserByActivationCodeForm';
    }

    get fallbackTarget() {
        return 'api/v1/activation-code';
    }
}
