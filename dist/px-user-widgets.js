class n extends HTMLElement {
  constructor() {
    super();
  }
  getAttrValues() {
    var e, t, s, o, i;
    this.containerId = (e = this.getAttribute("data-containerId")) != null ? e : this.getContainerId(), this.token = this.getAttribute("data-token"), this.primary_color = (t = this.getAttribute("data-primaryColor")) != null ? t : "#1E9FDA", this.appUrl = this.getAttribute("data-app-url"), this.cssUrl = `${this.appUrl}/storage/assets/css/px-user.css`, this.module = new PxModUser({
      stage: (s = this.getAttribute("stage")) != null ? s : window.PX_USER_STAGE,
      domain: (o = this.getAttribute("domain")) != null ? o : window.PX_USER_DOMAIN,
      tenant: (i = this.getAttribute("tenant")) != null ? i : window.PX_USER_TENANT,
      language: "de"
    });
  }
  connectedCallback() {
    this.getAttrValues();
    const e = document.createElement("div");
    e.id = this.containerId, e.classList.add("user-component"), this.append(e);
    const t = document.createElement("span");
    t.id = `${this.containerId}-error`, e.append(t);
    const s = document.createElement("span");
    s.id = `${this.containerId}-success`, e.append(s), this.mountIFrame();
  }
  mountIFrame() {
    console.warn("Override mountIFrame inside your class");
  }
  getContainerId() {
    console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
  }
  handleError(e) {
    var s;
    const t = document.querySelector(`#${this.containerId}-error`);
    t.textContent = (s = e.message) != null ? s : this._t("An error occured"), t.classList.add("error-message"), t.classList.add("mb-2");
  }
  showSuccess(e) {
    if (e.success) {
      document.querySelector(`#${this.containerId} .px-user-widget`).remove();
      const t = document.querySelector(`#${this.containerId}-success`);
      t.classList.add("success-message"), t.textContent = e.message, t.classList.add("mb-2");
    }
  }
  _t(e, t = {}) {
    return e;
  }
  get headers() {
    return {
      "Content-Type": "application/json"
    };
  }
  request(e, t = null) {
    return fetch(e, {
      method: t ? "POST" : "GET",
      redirect: "follow",
      headers: this.headers,
      body: JSON.stringify(t)
    });
  }
}
class a extends n {
  mountIFrame() {
    const e = `${this.appUrl}/api/v2/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: e,
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
  login(e) {
    const t = e.response;
    window.dispatchEvent(new CustomEvent("px-user-loggedIn", { detail: t }));
  }
}
class c extends n {
  mountIFrame() {
    const e = `${this.appUrl}/api/v1/doi-activation`;
    this.module.showActivateUserForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: e,
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
    const e = `${this.appUrl}/api/v1/reset-password`;
    this.module.showPasswordForgotForm({
      containerElement: this.containerId,
      fallbackTargetUrl: e,
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
    const e = `${this.appUrl}/api/v1/set-password`;
    this.module.showPasswordSetForm({
      token: this.token,
      containerElement: this.containerId,
      fallbackTargetUrl: e,
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
    const e = `${this.appUrl}/api/v1/admin/login`;
    this.module.showLoginForm({
      containerElement: this.containerId,
      fallbackTargetUrl: e,
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
  login(e) {
    const t = e.response;
    this.request("/admin/login", t).then(async (s) => {
      s.redirected && (window.location.href = s.url);
    });
  }
}
customElements.get("px-user-login") === void 0 && customElements.define("px-user-login", a);
customElements.get("px-user-activate-user") === void 0 && customElements.define("px-user-activate-user", c);
customElements.get("px-user-forgot-password") === void 0 && customElements.define("px-user-forgot-password", d);
customElements.get("px-user-set-password") === void 0 && customElements.define("px-user-set-password", l);
customElements.get("px-user-admin-login") === void 0 && customElements.define("px-user-admin-login", u);
