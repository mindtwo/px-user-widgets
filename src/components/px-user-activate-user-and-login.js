import {UserComponent} from './user-component';

export class PxUserActivateUserAndLogin extends UserComponent {
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
            showPasswordRules: true,
            fallbackButtonText: 'Activate user and login!',
            token: this.token,
            icons: {
                togglePassword: {
                    passwordOne: true,
                    passwordTwo: true
                },
            },
            onSuccess: (response) => this.login(response),
        }
    }

    get widget() {
        return 'showActivateUserLoginForm';
    }

    get fallbackTarget() {
        return 'api/v1/activate-user-and-login';
    }
}
