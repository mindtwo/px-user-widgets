import {PxUserLogin} from './components/px-user-login';
import {PxUserActivateUser} from './components/px-user-activate-user';
import {PxUserForgotPassword} from './components/px-user-forgot-password';
import {PxUserSetPassword} from './components/px-user-set-password';
import {PxUserActivateUserAndLogin} from './components/px-user-activate-user-and-login';
import {PxUserActivateUserWithActivationCode} from './components/px-user-activate-user-with-activation-code';
import {PxUserSetPasswordByForgotPasswordCodeAndLogin} from './components/px-user-set-password-by-forgot-password-code-and-login';
import { PxUserConfirmEmail } from './components/px-user-confirm-email';

// check if element exists and register if not
if(customElements.get('px-user-login') === undefined) {
    customElements.define('px-user-login', PxUserLogin);
}

// check if element exists and register if not
if(customElements.get('px-user-activate-user') === undefined) {
    customElements.define('px-user-activate-user', PxUserActivateUser);
}

// check if element exists and register if not
if(customElements.get('px-user-forgot-password') === undefined) {
    customElements.define('px-user-forgot-password', PxUserForgotPassword);
}

// check if element exists and register if not
if(customElements.get('px-user-set-password') === undefined) {
    customElements.define('px-user-set-password', PxUserSetPassword);
}

// check if element exists and register if not
if(customElements.get('px-user-activate-user-and-login') === undefined) {
    customElements.define('px-user-activate-user-and-login', PxUserActivateUserAndLogin);
}

// check if element exists and register if not
if(customElements.get('px-user-activate-user-with-activation-code') === undefined) {
    customElements.define('px-user-activate-user-with-activation-code', PxUserActivateUserWithActivationCode);
}

if (customElements.get('px-user-set-password-by-forgot-password-code-and-login') === undefined) {
    customElements.define('px-user-set-password-by-forgot-password-code-and-login', PxUserSetPasswordByForgotPasswordCodeAndLogin);
}

if (customElements.get('px-user-confirm-email') === undefined) {
    customElements.define('px-user-confirm-email', PxUserConfirmEmail);
}
