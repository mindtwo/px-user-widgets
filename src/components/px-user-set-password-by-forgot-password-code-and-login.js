import {UserComponent} from './user-component';

export class PxUserSetPasswordByForgotPasswordCodeAndLogin extends UserComponent {
    /**
     * Login user on success
     *
     * @param response
     */
    login(response) {
        window.dispatchEvent(new CustomEvent('px-user-loggedIn', {
            detail: response.response
        }));
    }

    get config() {
        return {
            ...super.config,
            token: this.token,
            showPasswordRules: true,
            fallbackButtonText: 'Reset Password!',
            icons: {
                togglePassword: {
                    passwordOne: true,
                    passwordTwo: true
                }
            },
            onSuccess: (response) => this.login(response),
        }
    }

    get widget() {
        return 'showPasswordSetByForgotPasswordCodeLoginForm';
    }

    get fallbackTarget() {
        return 'api/v1/set-password';
    }
}
