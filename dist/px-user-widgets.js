class n extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    var s, e, t, o, a, i;
    this.containerId = (s = this.getAttribute("data-containerId")) != null ? s : this.getContainerId(), this.token = this.getAttribute("data-token"), this.appUrl = this.getAttribute("data-app-url"), this.language = this.getAttribute("data-language"), this.cssPath = (e = this.getAttribute("data-css-path")) != null ? e : "storage/assets/css/px-user.css", this.module = new PxModUser({
      stage: (t = this.getAttribute("stage")) != null ? t : window.PX_USER_STAGE,
      domain: (o = this.getAttribute("domain")) != null ? o : window.PX_USER_DOMAIN,
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
  handleError(s) {
    var t;
    const e = document.querySelector(`#${this.containerId}-error`);
    e.textContent = (t = s.message) != null ? t : this._t("An error occured"), e.classList.add("error-message"), e.classList.add("mb-2");
  }
  showSuccess(s) {
    if (s.success) {
      document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      const e = document.querySelector(`#${this.containerId}-success`);
      e.classList.add("success-message"), e.textContent = s.message, e.classList.add("mb-2");
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
class c extends n {
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
class d extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackButtonText: "Set Password!",
      fallbackTargetUrl: s,
      cssUrl: this.cssUrl,
      onSuccess: (e) => this.showSuccess(e),
      onError: (e) => this.handleError(e)
    });
  }
  getContainerId() {
    return "px-user-activate-user";
  }
}
class l extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/reset-password`;
    this.module.showPasswordForgotForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
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
class u extends n {
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
    const s = `${this.appUrl}/api/v1/admin/login`;
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
    return "px-user-admin-login";
  }
  login(s) {
    const e = s.response;
    window.dispatchEvent(new CustomEvent("px-user-adminLoggedIn", { detail: e }));
  }
}
customElements.get("px-user-login") === void 0 && customElements.define("px-user-login", c);
customElements.get("px-user-activate-user") === void 0 && customElements.define("px-user-activate-user", d);
customElements.get("px-user-forgot-password") === void 0 && customElements.define("px-user-forgot-password", l);
customElements.get("px-user-set-password") === void 0 && customElements.define("px-user-set-password", u);
customElements.get("px-user-admin-login") === void 0 && customElements.define("px-user-admin-login", h);
