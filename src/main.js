import {PxUserLogin} from './components/px-user-login';
import {PxUserActivateUser} from './components/px-user-activate-user';
import {PxUserForgotPassword} from './components/px-user-forgot-password';
import {PxUserSetPassword} from './components/px-user-set-password';
import {PxUserAdminLogin} from './components/px-user-admin-login';

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
if(customElements.get('px-user-admin-login') === undefined) {
    customElements.define('px-user-admin-login', PxUserAdminLogin);
}
