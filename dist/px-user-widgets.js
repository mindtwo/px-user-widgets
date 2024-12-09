const parseHtml = (htmlString) => {
  const dom = new DOMParser().parseFromString(htmlString, "text/html");
  return dom.body.firstChild;
};
class UserComponent extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    this.containerId = this.getAttribute("data-containerId") ?? this.getContainerId();
    this.token = this.getAttribute("data-token");
    this.appUrl = this.getAttribute("data-app-url");
    this.language = this.getAttribute("data-language");
    this.showLoginWithEip = this.getAttribute("data-show-login-with-eip") === "true";
    this.cssPath = this.getAttribute("data-css-path") ?? "storage/assets/css/px-user.css";
    this.labels = JSON.parse(this.getAttribute("data-labels")) ?? {};
    this.module = new PxModUser({
      stage: this.getAttribute("stage") ?? window.PX_USER_STAGE,
      domain: this.getAttribute("domain") ?? window.PX_USER_DOMAIN,
      tenant: this.getAttribute("tenant") ?? window.PX_USER_TENANT,
      language: this.language ?? "de"
    });
  }
  /**
   * Executed when the element is mounted
   */
  connectedCallback() {
    this.getAttrValues();
    const wrapper = parseHtml(`<div id="${this.containerId}" class="user-component"></div>`);
    this.append(wrapper);
    this.mountIFrame();
    const errorMessageElem = parseHtml(`<span id="${this.containerId}-error" class="error-message mb-2" style="display: none;"></span>`);
    wrapper.append(errorMessageElem);
    this.errorMessageElem = errorMessageElem;
    const successMessageElem = parseHtml(`<span id="${this.containerId}-success" class="success-message mb-2" style="display: none;"></span>`);
    wrapper.append(successMessageElem);
    this.successMessageElem = successMessageElem;
  }
  /**
   * Mount iframe to our wrapper element.
   * This should use a the function from PxUserModule
   */
  mountIFrame() {
    console.warn("Override mountIFrame inside your class");
  }
  /**
   * Mount iframe to our wrapper element.
   * This should use a the function from PxUserModule
   */
  getContainerId() {
    console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
  }
  resetMessages() {
    this.successMessageElem.textContent = "";
    this.errorMessageElem.textContent = "";
    this.successMessageElem.style.display = "none";
    this.errorMessageElem.style.display = "none";
  }
  /**
   * Error handler
   * Shows error message in notification
   *
   * @param error
   */
  handleError(error) {
    this.resetMessages();
    let text = error.message ?? error;
    if (typeof text !== "string") {
      text = null;
      console.error(error);
    }
    this.errorMessageElem.textContent = text ?? "An error occurred";
    this.errorMessageElem.style.display = "block";
  }
  /**
   * Success handler
   *
   * @param data
   * @param remove
   */
  handleSuccess(data, removeIFrame = true) {
    this.resetMessages();
    if (data.success) {
      if (removeIFrame) {
        document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      }
      this.successMessageElem.textContent = data.message;
      this.successMessageElem.style.display = "block";
      window.dispatchEvent(new CustomEvent("px-user-success", {
        detail: data
      }));
    }
  }
  get cssUrl() {
    if (this.cssPath.startsWith("http://") || this.cssPath.startsWith("https://") || this.cssPath.startsWith("//")) {
      return this.cssPath;
    }
    return `${this.appUrl}/${this.cssPath}`;
  }
}
class PxUserLogin extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v2/login`;
    const conf = {
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Login!",
      icons: {
        togglePassword: {
          password: true
        }
      },
      cssUrl: this.cssUrl,
      onSuccess: (response) => this.login(response),
      onError: (response) => this.handleError(response)
    };
    if (Object.keys(this.labels).length > 0) {
      conf.labels = this.labels;
    }
    if (this.showLoginWithEip) {
      conf.showLoginWithEip = true;
      conf.state = "1234567890";
      conf.client_id = "abc123";
    }
    this.module.showLoginForm(conf);
  }
  /**
   * Get container fallback id
   *
   * @returns {string}
   */
  getContainerId() {
    return "px-user-login";
  }
  /**
   * Login user on success
   *
   * @param response
   */
  login(response) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: response.response
    }));
  }
}
class PxUserActivateUser extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackButtonText: "Set Password!",
      fallbackTargetUrl,
      cssUrl: this.cssUrl,
      onSuccess: (response) => this.handleSuccess(response),
      onError: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-activate-user";
  }
}
class PxUserForgotPassword extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/reset-password`;
    const conf = {
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Send password reset email!",
      cssUrl: this.cssUrl,
      onSuccess: (response) => this.handleSuccess(response),
      onError: (error) => this.handleError(error)
    };
    if (Object.keys(this.labels).length > 0) {
      conf.labels = this.labels;
    }
    this.module.showPasswordForgotForm(conf);
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-forgot-password";
  }
}
class PxUserSetPassword extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Reset Password!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: true,
          passwordTwo: true
        }
      },
      showPasswordRules: true,
      onSuccess: (response) => this.handleSuccess(response),
      onError: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-set-password";
  }
}
class PxUserActivateUserAndLogin extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/activate-user-and-login`;
    this.module.showActivateUserLoginForm({
      token: this.token,
      showPasswordRules: true,
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Activate user and login!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: true,
          passwordTwo: true
        }
      },
      onSuccess: (response) => this.login(response),
      onError: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-activate-user-and-login";
  }
  /**
   * Login user on success
   *
   * @param response
   */
  login(response) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: response.response
    }));
  }
}
class PxUserActivateUserWithActivationCode extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/activation-code`;
    this.module.showActivateUserByActivationCodeForm({
      token: this.token,
      showPasswordRules: true,
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Activate User",
      cssUrl: this.cssUrl,
      onSuccess: (response) => this.activated(response),
      onError: (error) => this.handleError(error),
      onSuccessActivationCode: (response) => this.handleSuccess(response, false),
      onErrorActivationCode: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-activate-user-with-activation-code";
  }
  /**
   * Login user on success
   *
   * @param response
   */
  activated(response) {
    window.dispatchEvent(new CustomEvent("px-user-activated", {
      detail: response.response
    }));
    this.handleSuccess(response);
  }
}
class PxUserSetPasswordByForgotPasswordCodeAndLogin extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetByForgotPasswordCodeLoginForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Reset Password!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: true,
          passwordTwo: true
        }
      },
      showPasswordRules: true,
      onSuccess: (response) => this.login(response),
      onError: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-set-password-by-forgot-password-code-and-login";
  }
  /**
   * Login user on success
   *
   * @param response
   */
  login(response) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: response.response
    }));
  }
}
class PxUserConfirmEmail extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v1/confirm-new-email`;
    this.module.showConfirmNewEmailForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl,
      fallbackButtonText: "Confirm New Email",
      cssUrl: this.cssUrl,
      onSuccess: (response) => {
        if (!response.success) {
          return this.handleError(response);
        }
        window.dispatchEvent(new CustomEvent("px-user-email-confirmed", {
          detail: response
        }));
      },
      onError: (error) => this.handleError(error)
    });
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-confirm-email";
  }
}
class PxUserEipConfig extends UserComponent {
  /**
   * Mount iframe
   */
  mountIFrame() {
    const fallbackTargetUrl = `${this.appUrl}/api/v2/eip-config`;
    const conf = {
      token: this.token,
      containerElement: this.containerId,
      fallbackButtonText: "Save config",
      fallbackTargetUrl,
      cssUrl: this.cssUrl,
      onSuccess: (response) => this.showSuccess(response),
      onError: (error) => this.showError(error)
    };
    if (Object.keys(this.labels).length > 0) {
      conf.labels = this.labels;
    }
    this.module.showEipConfigForm(conf);
  }
  /**
   * Get container fallback id
   *
   * @returns {String}
   */
  getContainerId() {
    return "px-user-eip-config";
  }
  /**
   * Handle success
   *
   * @param response
   */
  showSuccess(response) {
    this.handleSuccess(response.data, response.source === "save" && response.data.success);
    window.dispatchEvent(new CustomEvent("px-user-eip-config-success", {
      detail: response
    }));
  }
  /**
   * Handle error
   *
   * @param error
   */
  showError(error) {
    this.handleError(error.data);
  }
}
if (customElements.get("px-user-login") === void 0) {
  customElements.define("px-user-login", PxUserLogin);
}
if (customElements.get("px-user-activate-user") === void 0) {
  customElements.define("px-user-activate-user", PxUserActivateUser);
}
if (customElements.get("px-user-forgot-password") === void 0) {
  customElements.define("px-user-forgot-password", PxUserForgotPassword);
}
if (customElements.get("px-user-set-password") === void 0) {
  customElements.define("px-user-set-password", PxUserSetPassword);
}
if (customElements.get("px-user-activate-user-and-login") === void 0) {
  customElements.define("px-user-activate-user-and-login", PxUserActivateUserAndLogin);
}
if (customElements.get("px-user-activate-user-with-activation-code") === void 0) {
  customElements.define("px-user-activate-user-with-activation-code", PxUserActivateUserWithActivationCode);
}
if (customElements.get("px-user-set-password-by-forgot-password-code-and-login") === void 0) {
  customElements.define("px-user-set-password-by-forgot-password-code-and-login", PxUserSetPasswordByForgotPasswordCodeAndLogin);
}
if (customElements.get("px-user-confirm-email") === void 0) {
  customElements.define("px-user-confirm-email", PxUserConfirmEmail);
}
if (customElements.get("px-user-eip-config") === void 0) {
  customElements.define("px-user-eip-config", PxUserEipConfig);
}
