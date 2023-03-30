class n extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    var s, t, e, o, a;
    this.containerId = (s = this.getAttribute("data-containerId")) != null ? s : this.getContainerId(), this.token = this.getAttribute("data-token"), this.appUrl = this.getAttribute("data-app-url"), this.cssPath = (t = this.getAttribute("data-css-path")) != null ? t : "storage/assets/css/px-user.css", this.module = new PxModUser({
      stage: (e = this.getAttribute("stage")) != null ? e : window.PX_USER_STAGE,
      domain: (o = this.getAttribute("domain")) != null ? o : window.PX_USER_DOMAIN,
      tenant: (a = this.getAttribute("tenant")) != null ? a : window.PX_USER_TENANT,
      language: "de"
    });
  }
  connectedCallback() {
    this.getAttrValues();
    const s = document.createElement("div");
    s.id = this.containerId, s.classList.add("user-component"), this.append(s);
    const t = document.createElement("span");
    t.id = `${this.containerId}-error`, s.append(t);
    const e = document.createElement("span");
    e.id = `${this.containerId}-success`, s.append(e), this.mountIFrame();
  }
  mountIFrame() {
    console.warn("Override mountIFrame inside your class");
  }
  getContainerId() {
    console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
  }
  handleError(s) {
    var e;
    const t = document.querySelector(`#${this.containerId}-error`);
    t.textContent = (e = s.message) != null ? e : this._t("An error occured"), t.classList.add("error-message"), t.classList.add("mb-2");
  }
  showSuccess(s) {
    if (s.success) {
      document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      const t = document.querySelector(`#${this.containerId}-success`);
      t.classList.add("success-message"), t.textContent = s.message, t.classList.add("mb-2");
    }
  }
  _t(s, t = {}) {
    return s;
  }
  get headers() {
    return {
      "Content-Type": "application/json"
    };
  }
  get cssUrl() {
    return this.cssPath.startsWith("http://") || this.cssPath.startsWith("https://") || this.cssPath.startsWith("//") ? this.cssPath : `${this.appUrl}/${this.cssPath}`;
  }
  request(s, t = null) {
    return fetch(s, {
      method: t ? "POST" : "GET",
      redirect: "follow",
      headers: this.headers,
      body: JSON.stringify(t)
    });
  }
}
class i extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v2/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: this._t("Login"),
      cssUrl: this.cssUrl,
      labels: {
        buttonText: this._t("Login"),
        username: this._t("Email"),
        password: this._t("Password")
      },
      onSuccess: (t) => this.login(t),
      onError: (t) => this.handleError(t)
    });
  }
  getContainerId() {
    return "px-user-login";
  }
  login(s) {
    const t = s.response;
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", { detail: t }));
  }
}
class c extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: this._t("Set password"),
      cssUrl: this.cssUrl,
      labels: {
        buttonText: this._t("Set password"),
        passwordOne: this._t("Password"),
        passwordTwo: this._t("Password confirmation")
      },
      onSuccess: (t) => this.showSuccess(t),
      onError: (t) => this.handleError(t)
    });
  }
  getContainerId() {
    return "px-user-activate-user";
  }
}
class d extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/reset-password`;
    this.module.showPasswordForgotForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: this._t("Reset password"),
      cssUrl: this.cssUrl,
      labels: {
        buttonText: this._t("Reset password"),
        email: this._t("Email")
      },
      onSuccess: (t) => this.showSuccess(t),
      onError: (t) => this.handleError(t)
    });
  }
  getContainerId() {
    return "px-user-forgot-password";
  }
}
class l extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: this._t("Password reset"),
      cssUrl: this.cssUrl,
      labels: {
        buttonText: this._t("Password reset"),
        passwordOne: this._t("Password"),
        passwordTwo: this._t("Password confirmation")
      },
      onSuccess: (t) => this.showSuccess(t),
      onError: (t) => this.handleError(t)
    });
  }
  getContainerId() {
    return "px-user-set-password";
  }
}
class u extends n {
  mountIFrame() {
    const s = `${this.appUrl}/api/v1/admin/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: s,
      fallbackButtonText: this._t("Login"),
      cssUrl: this.cssUrl,
      labels: {
        buttonText: this._t("Login"),
        username: this._t("Email"),
        password: this._t("Password")
      },
      onSuccess: (t) => this.login(t),
      onError: (t) => this.handleError(t)
    });
  }
  getContainerId() {
    return "px-user-admin-login";
  }
  login(s) {
    const t = s.response;
    window.dispatchEvent(new CustomEvent("px-user-adminLoggedIn", { detail: t }));
  }
}
customElements.get("px-user-login") === void 0 && customElements.define("px-user-login", i);
customElements.get("px-user-activate-user") === void 0 && customElements.define("px-user-activate-user", c);
customElements.get("px-user-forgot-password") === void 0 && customElements.define("px-user-forgot-password", d);
customElements.get("px-user-set-password") === void 0 && customElements.define("px-user-set-password", l);
customElements.get("px-user-admin-login") === void 0 && customElements.define("px-user-admin-login", u);
