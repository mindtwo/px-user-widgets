import {UserComponent} from './user-component';

export class PxUserLogin extends UserComponent {
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
            fallbackButtonText: 'Login!',
            icons: {
                togglePassword: {
                    password: true
                }
            },
            onSuccess: (response) => this.login(response),
        }
    }

    get widget() {
        return 'showLoginForm';
    }

    get fallbackTarget() {
        return 'api/v2/login';
    }
}
