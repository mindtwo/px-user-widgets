import {UserComponent} from './user-component';

export class PxUserSetPassword extends UserComponent {
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
        }
    }

    get widget() {
        return 'showPasswordSetForm';
    }

    get fallbackTarget() {
        return 'api/v1/set-password';
    }
}
