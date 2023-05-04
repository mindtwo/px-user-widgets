class n extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    var t, e, s, o, a, i;
    this.containerId = (t = this.getAttribute("data-containerId")) != null ? t : this.getContainerId(), this.token = this.getAttribute("data-token"), this.appUrl = this.getAttribute("data-app-url"), this.language = this.getAttribute("data-language"), this.cssPath = (e = this.getAttribute("data-css-path")) != null ? e : "storage/assets/css/px-user.css", this.module = new PxModUser({
      stage: (s = this.getAttribute("stage")) != null ? s : window.PX_USER_STAGE,
      domain: (o = this.getAttribute("domain")) != null ? o : window.PX_USER_DOMAIN,
      tenant: (a = this.getAttribute("tenant")) != null ? a : window.PX_USER_TENANT,
      language: (i = this.language) != null ? i : "de"
    });
  }
  connectedCallback() {
    this.getAttrValues();
    const t = document.createElement("div");
    t.id = this.containerId, t.classList.add("user-component"), this.append(t);
    const e = document.createElement("span");
    e.id = `${this.containerId}-error`, t.append(e);
    const s = document.createElement("span");
    s.id = `${this.containerId}-success`, t.append(s), this.mountIFrame();
  }
  mountIFrame() {
    console.warn("Override mountIFrame inside your class");
  }
  getContainerId() {
    console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
  }
  handleError(t) {
    var s;
    const e = document.querySelector(`#${this.containerId}-error`);
    e.textContent = (s = t.message) != null ? s : this._t("An error occured"), e.classList.add("error-message"), e.classList.add("mb-2");
  }
  showSuccess(t) {
    if (t.success) {
      document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      const e = document.querySelector(`#${this.containerId}-success`);
      e.classList.add("success-message"), e.textContent = t.message, e.classList.add("mb-2");
    }
  }
  get headers() {
    return {
      "Content-Type": "application/json"
    };
  }
  get cssUrl() {
    return this.cssPath.startsWith("http://") || this.cssPath.startsWith("https://") || this.cssPath.startsWith("//") ? this.cssPath : `${this.appUrl}/${this.cssPath}`;
  }
  request(t, e = null) {
    return fetch(t, {
      method: e ? "POST" : "GET",
      redirect: "follow",
      headers: this.headers,
      body: JSON.stringify(e)
    });
  }
}
class c extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v2/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: t,
      fallbackButtonText: "Login!",
      icons: {
        togglePassword: {
          password: !0
        }
      },
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.login(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-login";
  }
  login(t) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: t.response
    }));
  }
}
class d extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackButtonText: "Set Password!",
      fallbackTargetUrl: t,
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.showSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user";
  }
}
class u extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v1/reset-password`;
    this.module.showPasswordForgotForm({
      containerElement: this.containerId,
      fallbackTargetUrl: t,
      fallbackButtonText: "Send password reset email!",
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.showSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-forgot-password";
  }
}
class l extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: t,
      fallbackButtonText: "Reset Password!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: !0,
          passwordTwo: !0
        }
      },
      showPasswordRules: !0,
      onSuccess: (e) => this.showSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-set-password";
  }
}
class h extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v1/activate-user-and-login`;
    this.module.showActivateUserLoginForm({
      token: this.token,
      showPasswordRules: !0,
      containerElement: this.containerId,
      fallbackTargetUrl: t,
      fallbackButtonText: "Activate user and login!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: !0,
          passwordTwo: !0
        }
      },
      onSuccess: (e) => this.login(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user-and-login";
  }
  login(t) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: t.response
    }));
  }
}
class m extends n {
  mountIFrame() {
    const t = `${this.appUrl}/api/v1/activation-code`;
    this.module.showActivateUserByActivationCodeForm({
      token: this.token,
      showPasswordRules: !0,
      containerElement: this.containerId,
      fallbackTargetUrl: t,
      fallbackButtonText: "Activate User",
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.showSuccess(e),
      onError: (e) => this.handleError(e),
      onSuccessActivationCode: (e) => this.showSuccess(e),
      onErrorActivationCode: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user-with-activation-code";
  }
}
customElements.get("px-user-login") === void 0 && customElements.define("px-user-login", c);
customElements.get("px-user-activate-user") === void 0 && customElements.define("px-user-activate-user", d);
customElements.get("px-user-forgot-password") === void 0 && customElements.define("px-user-forgot-password", u);
customElements.get("px-user-set-password") === void 0 && customElements.define("px-user-set-password", l);
customElements.get("px-user-activate-user-and-login") === void 0 && customElements.define("px-user-activate-user-and-login", h);
customElements.get("px-user-activate-user-with-activation-code") === void 0 && customElements.define("px-user-activate-user-with-activation-code", m);
