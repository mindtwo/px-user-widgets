import { createCustomElement, createWidgetElement } from './helper/index.js';
// Special widgets
import { PxUserLogin } from './widgets/px-user-login';

import { PxUserSetPassword } from './components/px-user-set-password';
import { PxUserActivateUserAndLogin } from './components/px-user-activate-user-and-login';
import { PxUserActivateUserWithActivationCode } from './components/px-user-activate-user-with-activation-code';
import { PxUserSetPasswordByForgotPasswordCodeAndLogin } from './components/px-user-set-password-by-forgot-password-code-and-login';
import { PxUserConfirmEmail } from './components/px-user-confirm-email';
import { PxUserEipConfig } from './components/px-user-eip-config.js';
import { PxUserTokenWidget } from './base/px-user-token-widget.js';

// Login widget
createCustomElement('px-user-login', PxUserLogin);

// Create custom element for forgot password
createWidgetElement('password-forgot', 'px-user-forgot-password');

// Create element for activate user
createWidgetElement('activate-user', undefined, PxUserTokenWidget);

// check if element exists and register if not
if (customElements.get('px-user-set-password') === undefined) {
    customElements.define('px-user-set-password', PxUserSetPassword);
}

// check if element exists and register if not
if (customElements.get('px-user-activate-user-and-login') === undefined) {
    customElements.define(
        'px-user-activate-user-and-login',
        PxUserActivateUserAndLogin,
    );
}

// check if element exists and register if not
if (
    customElements.get('px-user-activate-user-with-activation-code') ===
    undefined
) {
    customElements.define(
        'px-user-activate-user-with-activation-code',
        PxUserActivateUserWithActivationCode,
    );
}

if (
    customElements.get(
        'px-user-set-password-by-forgot-password-code-and-login',
    ) === undefined
) {
    customElements.define(
        'px-user-set-password-by-forgot-password-code-and-login',
        PxUserSetPasswordByForgotPasswordCodeAndLogin,
    );
}

if (customElements.get('px-user-confirm-email') === undefined) {
    customElements.define('px-user-confirm-email', PxUserConfirmEmail);
}

if (customElements.get('px-user-eip-config') === undefined) {
    customElements.define('px-user-eip-config', PxUserEipConfig);
}
