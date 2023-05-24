import {UserComponent} from './user-component';

export class PxUserActivateUser extends UserComponent {
    get config() {
        return {
            ...super.config,
            fallbackButtonText: 'Set Password!',
            token: this.token,
        }
    }

    get widget() {
        return 'showActivateUserForm';
    }

    get fallbackTarget() {
        return 'api/v1/doi-activation';
    }

}
