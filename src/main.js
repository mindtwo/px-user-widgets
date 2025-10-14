import { createCustomElement, createWidgetElement } from './helper/index.js';
// Base
import { PxUserTokenWidget } from './base/px-user-token-widget.js';
// Special widgets
import { PxUserLogin } from './widgets/px-user-login';
import { PxUserActivateUserWithActivationCode } from './widgets/px-user-activate-user-with-activation-code';
import { PxUserActivateUserAndLogin } from './widgets/px-user-activate-user-and-login';
import { PxUserSetPasswordByForgotPasswordCodeAndLogin } from './widgets/px-user-set-password-by-forgot-password-code-and-login';
import { PxUserSetPassword } from './widgets/px-user-set-password';
import { PxUserEipConfig } from './widgets/px-user-eip-config.js';

// Login widget
createCustomElement('px-user-login', PxUserLogin);

// Create custom element for forgot password
createWidgetElement('password-forgot', 'px-user-forgot-password');

// Create element for activate user
createWidgetElement('activate-user', undefined, PxUserTokenWidget);

// Create WidgetElement
createCustomElement(
    'px-user-activate-user-and-login',
    PxUserActivateUserAndLogin,
);

// Create WidgetElement for activation by code
createCustomElement(
    'px-user-activate-user-with-activation-code',
    PxUserActivateUserWithActivationCode,
);

// Create custom element for set password
createCustomElement(
    'px-user-set-password-by-forgot-password-code-and-login',
    PxUserSetPasswordByForgotPasswordCodeAndLogin,
);

// Confirm email widget
createWidgetElement(
    'confirm-new-email',
    'px-user-confirm-email',
    PxUserTokenWidget,
);

// Create custom element for set password
createCustomElement('px-user-set-password', PxUserSetPassword);

createCustomElement('px-user-eip-config', PxUserEipConfig);
