import {UserComponent} from './user-component';

export class PxUserForgotPassword extends UserComponent {

    get config() {
        return {
            ...super.config,
            fallbackButtonText: 'Send password reset email!',
        }
    }

    get widget() {
        return 'showPasswordForgotForm';
    }

    get fallbackTarget() {
        return 'api/v1/reset-password';
    }
}
