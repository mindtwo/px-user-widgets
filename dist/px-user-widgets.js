class o extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    var s, e, t, n, a, i;
    this.containerId = (s = this.getAttribute("data-containerId")) != null ? s : this.getContainerId(), this.token = this.getAttribute("data-token"), this.appUrl = this.getAttribute("data-app-url"), this.language = this.getAttribute("data-language"), this.cssPath = (e = this.getAttribute("data-css-path")) != null ? e : "storage/assets/css/px-user.css", this.module = new PxModUser({
      stage: (t = this.getAttribute("stage")) != null ? t : window.PX_USER_STAGE,
      domain: (n = this.getAttribute("domain")) != null ? n : window.PX_USER_DOMAIN,
      tenant: (a = this.getAttribute("tenant")) != null ? a : window.PX_USER_TENANT,
      language: (i = this.language) != null ? i : "de"
    });
  }
  connectedCallback() {
    this.getAttrValues();
    const s = document.createElement("div");
    s.id = this.containerId, s.classList.add("user-component"), this.append(s);
    const e = document.createElement("span");
    e.id = `${this.containerId}-error`, s.append(e);
    const t = document.createElement("span");
    t.id = `${this.containerId}-success`, s.append(t), this.mountIFrame();
  }
  mountIFrame() {
    console.warn("Override mountIFrame inside your class");
  }
  getContainerId() {
    console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
  }
  resetMessages() {
    const s = document.querySelector(`#${this.containerId}-error`), e = document.querySelector(`#${this.containerId}-success`);
    s.textContent = "", s.classList.remove("error-message", "mb-2"), e.textContent = "", e.classList.remove("success-message", "mb-2");
  }
  handleError(s) {
    this.resetMessages();
    const e = document.querySelector(`#${this.containerId}-error`);
    e.textContent = s.message, e.classList.add("error-message"), e.classList.add("mb-2");
  }
  handleSuccess(s, e = !0) {
    if (this.resetMessages(), s.success) {
      e && document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      const t = document.querySelector(`#${this.containerId}-success`);
      t.textContent = s.message, t.classList.add("success-message"), t.classList.add("mb-2"), window.dispatchEvent(new CustomEvent("px-user-success", {
        detail: s
      }));
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
  request(s, e = null) {
    return fetch(s, {
      method: e ? "POST" : "GET",
      redirect: "follow",
      headers: this.headers,
      body: JSON.stringify(e)
    });
  }
}
class c extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v2/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
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
  login(s) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: s.response
    }));
  }
}
class d extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackButtonText: "Set Password!",
      fallbackTargetUrl: s,
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.handleSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user";
  }
}
class l extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/reset-password`;
    this.module.showPasswordForgotForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: "Send password reset email!",
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.handleSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-forgot-password";
  }
}
class u extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: "Reset Password!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: !0,
          passwordTwo: !0
        }
      },
      showPasswordRules: !0,
      onSuccess: (e) => this.handleSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-set-password";
  }
}
class h extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/activate-user-and-login`;
    this.module.showActivateUserLoginForm({
      token: this.token,
      showPasswordRules: !0,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
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
  login(s) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: s.response
    }));
  }
}
class g extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/activation-code`;
    this.module.showActivateUserByActivationCodeForm({
      token: this.token,
      showPasswordRules: !0,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: "Activate User",
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.activated(e),
      onError: (e) => this.handleError(e),
      onSuccessActivationCode: (e) => this.handleSuccess(e, !1),
      onErrorActivationCode: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user-with-activation-code";
  }
  activated(s) {
    window.dispatchEvent(new CustomEvent("px-user-activated", {
      detail: s.response
    })), this.handleSuccess(s);
  }
}
class m extends o {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetByForgotPasswordCodeLoginForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: "Reset Password!",
      cssUrl: this.cssUrl,
      icons: {
        togglePassword: {
          passwordOne: !0,
          passwordTwo: !0
        }
      },
      showPasswordRules: !0,
      onSuccess: (e) => this.login(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-set-password-by-forgot-password-code-and-login";
  }
  login(s) {
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", {
      detail: s.response
    }));
  }
}
customElements.get("px-user-login") === void 0 && customElements.define("px-user-login", c);
customElements.get("px-user-activate-user") === void 0 && customElements.define("px-user-activate-user", d);
customElements.get("px-user-forgot-password") === void 0 && customElements.define("px-user-forgot-password", l);
customElements.get("px-user-set-password") === void 0 && customElements.define("px-user-set-password", u);
customElements.get("px-user-activate-user-and-login") === void 0 && customElements.define("px-user-activate-user-and-login", h);
customElements.get("px-user-activate-user-with-activation-code") === void 0 && customElements.define("px-user-activate-user-with-activation-code", g);
customElements.get("px-user-set-password-by-forgot-password-code-and-login") === void 0 && customElements.define("px-user-set-password-by-forgot-password-code-and-login", m);
