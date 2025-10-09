(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})((function() {
  "use strict";var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create((base == null ? void 0 : base[__knownSymbol("metadata")]) ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  var _PxUserBaseWidget_decorators, _init, _a;
  var stringCamelCase = camelCase;
  var wordSeparatorsRegEx = /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;
  var basicCamelRegEx = /^[a-z\u00E0-\u00FCA-Z\u00C0-\u00DC][\d|a-z\u00E0-\u00FCA-Z\u00C0-\u00DC]*$/;
  var fourOrMoreConsecutiveCapsRegEx = /([A-Z\u00C0-\u00DC]{4,})/g;
  var allCapsRegEx = /^[A-Z\u00C0-\u00DC]+$/;
  function camelCase(str) {
    var words = str.split(wordSeparatorsRegEx);
    var len = words.length;
    var mappedWords = new Array(len);
    for (var i = 0; i < len; i++) {
      var word = words[i];
      if (word === "") {
        continue;
      }
      var isCamelCase = basicCamelRegEx.test(word) && !allCapsRegEx.test(word);
      if (isCamelCase) {
        word = word.replace(fourOrMoreConsecutiveCapsRegEx, function(match, p1, offset) {
          return deCap(match, word.length - offset - match.length == 0);
        });
      }
      var firstLetter = word[0];
      firstLetter = i > 0 ? firstLetter.toUpperCase() : firstLetter.toLowerCase();
      mappedWords[i] = firstLetter + (!isCamelCase ? word.slice(1).toLowerCase() : word.slice(1));
    }
    return mappedWords.join("");
  }
  function deCap(match, endOfWord) {
    var arr = match.split("");
    var first = arr.shift().toUpperCase();
    var last = endOfWord ? arr.pop().toLowerCase() : arr.pop();
    return first + arr.join("").toLowerCase() + last;
  }
  var stringCapitalize = capitalize;
  function capitalize(str) {
    if (typeof str != "string") {
      throw Error("just-capitalize expects a string argument");
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  function WithLogger(target) {
    const verbosity = window.PX_WIDGETS_VERBOSITY || "warn";
    Object.assign(target.prototype, logger("PX-User Widgets", verbosity));
  }
  _PxUserBaseWidget_decorators = [WithLogger];
  class PxUserBaseWidget extends (_a = HTMLElement) {
    /**
     * The name of the widget, used for identification.
     * This should be set in the subclass.
     * @type {string}
     */
    // static widgetName = '';
    constructor() {
      super();
      /**
       * Configuration object for the widget.
       * This is used to store the configuration values from the element attributes.
       */
      __publicField(this, "_config", {});
      /**
       * List of configuration keys that are allowed to be set via attributes.
       * This list indicates prefix data- is not needed.
       *
       * @type {string[]}
       */
      __publicField(this, "configKeys", ["stage", "tenant", "domain"]);
      /**
       * The root container element for the widget.
       * This is used to mount the iframe and display messages.
       */
      __publicField(this, "_root", null);
      /**
       * Message elements used to display success and error messages.
       */
      __publicField(this, "_successMessageEl", null);
      __publicField(this, "_errorMessageEl", null);
      this.debugLog("widget created");
    }
    /**
     * Mount iframe to our wrapper element.
     * This should use a the function from PxUserModule
     */
    mountIFrame() {
      const widgetName = this.constructor.widgetName;
      if (!widgetName) {
        this.error(
          "[PX-User Widgets]: No widgetName set, cannot mount iframe"
        );
        return;
      }
      const fallbackTargetUrl = this.config(
        "fallbackTargetUrl",
        `${this.appUrl}/api/v2/${widgetName}`
      );
      const fallbackButtonText = this.config(
        "fallbackButtonText",
        stringCapitalize(widgetName.replace("-", " "))
      );
      let config = {
        containerElement: this.containerId,
        fallbackTargetUrl,
        fallbackButtonText,
        cssUrl: this.cssUrl,
        onSuccess: (response) => this.onSuccess(response),
        onError: (response) => this.onError(response)
      };
      if (typeof this.configureWidget === "function") {
        const c = this.configureWidget(config);
        config = c;
      }
      this.info("mountIFrame", "Mounting iframe with config:", config);
      const formMethod = stringCamelCase(["show", widgetName, "form"].join("-"));
      this.module[formMethod](config);
    }
    /**
     * Executed when the element is mounted
     */
    connectedCallback() {
      this.debugLog("connectedCallback", this.containerId, this._config);
      this.events = emitter(this);
      this.loadConfig();
      this.createRootElement();
      this.createMessageElements();
      waitForObject("PxModUser").then((module) => {
        this.initUserModule(module);
        this.mountIFrame();
        this.events.emit("mounted");
      });
    }
    /**
     * Create the root element for the widget.
     * This is used to mount the iframe and display messages.
     */
    // eslint-disable-next-line class-methods-use-this
    createRootElement() {
      this._root = parseHtml(
        `<div id="${this.containerId}" class="user-component"></div>`
      );
      this.appendChild(this._root);
    }
    /**
     * Initialize the user module with the given module class.
     * This should be called in the subclass to set up the module.
     *
     * @param {Function} module - The module class to initialize.
     */
    initUserModule(module) {
      this.module = new module({
        stage: this.config("stage", window.PX_USER_STAGE),
        domain: this.config("domain", window.PX_USER_DOMAIN),
        tenant: this.config("tenant", window.PX_USER_TENANT),
        language: this.config("language", "de")
      });
    }
    /**
     * Get container fallback id
     *
     * @returns {string}
     */
    get containerId() {
      return this.config("containerId") ?? (this.constructor.widgetName ? `px-user-widget-${this.constructor.widgetName}` : null);
    }
    /**
     * Get the app url
     *
     * @returns {string}
     */
    get appUrl() {
      return this.config("appUrl", window.PX_USER_APP_URL);
    }
    /**
     * Get the css url
     *
     * @returns {string}
     */
    get cssUrl() {
      const cssPath = this.config("cssPath", "css/px-user.css");
      if (cssPath.startsWith("http://") || cssPath.startsWith("https://") || cssPath.startsWith("//")) {
        return cssPath;
      }
      return `${this.appUrl}/${cssPath}`;
    }
    /**
     * Get the config value for the given option name
     *
     * @param optionName
     * @param fallback
     * @returns {*}
     */
    config(optionName, fallback = void 0) {
      if (this._config[optionName] !== void 0) {
        return this._config[optionName];
      }
      return fallback;
    }
    /**
     * Load the config values from the element attributes
     * and set them to the _config object.
     *
     * @param optionName
     * @param value
     */
    loadConfig() {
      if (Object.keys(this._config).length > 0) {
        this.info("loadConfig", "Config already loaded", this._config);
        return;
      }
      for (const attr of this.attributes) {
        if (!attr.name.startsWith("data-") && !this.configKeys.includes(attr.name)) {
          this.debugLog("loadConfig", "Skipping attribute", attr.name);
          continue;
        }
        const [opt, modifier] = attr.name.split("_");
        const optionName = stringCamelCase(opt.replace("data-", ""));
        let value = attr.value;
        if (modifier === "json") {
          try {
            value = JSON.parse(attr.value);
          } catch (e) {
            this.warn(
              `Failed to parse JSON for ${optionName}:`,
              e,
              attr.value
            );
          }
        }
        this._config[optionName] = value;
      }
      this.debugLog("config loaded for widget");
    }
    /**
     * Toggle the visibility of the success or error message element.
     *
     * @param {string} type - The type of message ('success' or 'error').
     * @param {boolean} [state] - If true, show the message; if false, hide it.
     *                            If undefined, toggle the visibility.
     */
    // eslint-disable-next-line class-methods-use-this
    toggleMessageElement(type, state) {
      if (!["success", "error"].includes(type)) {
        this.warn("can only toggle success or error messages");
        return;
      }
      const messageEl = this[`_${type}MessageEl`];
      let display = "";
      if (state === true) {
        display = "block";
      } else if (state === false) {
        display = "none";
      } else {
        display = messageEl.style.display === "none" ? "block" : "none";
      }
      if (display === "none") {
        messageEl.textContent = "";
      }
      messageEl.style.display = display;
    }
    /**
     * Display a success or error message to the user.
     * This will show the corresponding message element and set its text content.
     *
     * @param {string} type - The type of message ('success' or 'error').
     * @param {string} message - The message to display.
     */
    displayMessage(type, message) {
      if (!["success", "error"].includes(type)) {
        this.warn("can only display success or error messages");
        return;
      }
      const messageEl = this[`_${type}MessageEl`];
      messageEl.textContent = message;
      this.toggleMessageElement(type, true);
    }
    /**
     * Create message elements for success and error messages.
     * This is used to display messages to the user.
     */
    createMessageElements() {
      const errorMessageElem = parseHtml(
        `<span id="${this.containerId}-error" class="error-message mb-2" style="display: none;"></span>`
      );
      this.insertBefore(errorMessageElem, this._root);
      this._errorMessageEl = errorMessageElem;
      const successMessageElem = parseHtml(
        `<span id="${this.containerId}-success" class="success-message mb-2" style="display: none;"></span>`
      );
      this.insertBefore(successMessageElem, this._root);
      this._successMessageEl = successMessageElem;
    }
    /**
     * Handle error response from the module.
     * This should be overridden in the subclass to handle errors.
     *
     * @param {Object} event - The error response object.
     * @return {void}
     */
    onError(event) {
      const errorMessage = event.message ?? "An error occurred.";
      this.error(errorMessage);
      this.displayMessage("error", errorMessage);
      this.events.emit(this.getErrorEventName(), event);
    }
    /**
     * Handle success response from the module.
     * This should be overridden in the subclass to handle successful responses.
     *
     * @param {Object} response - The success response object.
     * @return {void}
     */
    onSuccess(event) {
      this.debugLog("onSuccess", event);
      this.events.emit(this.getSuccessEventName(), event);
    }
    getSuccessEventName() {
      if (this.constructor.successEventName) {
        return this.constructor.successEventName;
      }
      return this.successEventName || "success";
    }
    getErrorEventName() {
      if (this.constructor.errorEventName) {
        return this.constructor.errorEventName;
      }
      return this.errorEventName || "error";
    }
  }
  _init = __decoratorStart(_a);
  PxUserBaseWidget = __decorateElement(_init, 0, "PxUserBaseWidget", _PxUserBaseWidget_decorators, PxUserBaseWidget);
  __runInitializers(_init, 1, PxUserBaseWidget);
  function parseHtml(htmlString) {
    try {
      const dom = new DOMParser().parseFromString(htmlString, "text/html");
      return dom.body.firstChild;
    } catch (error) {
      console.log("Error parsing HTML string:", error);
    }
  }
  function waitForObject(name) {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (window[name]) {
          clearInterval(intervalId);
          resolve(window[name]);
        }
      }, 100);
    });
  }
  function logger(prefix = "", verbosity = "info") {
    if (!(window == null ? void 0 : window.console)) {
      return {};
    }
    const severities = {
      debug: 1,
      info: 10,
      warn: 20,
      error: 30
    };
    const currentVerbosity = severities[verbosity] || severities.info;
    if (currentVerbosity === 1) {
      console.log(
        `Logger initialized with prefix: ${prefix} and verbosity: ${verbosity}`
      );
    }
    const printMessage = (severity = "info", ...args) => {
      const messageVerbosity = severities[severity];
      if (!messageVerbosity) {
        if (currentVerbosity === 1) {
          console.warn(`Invalid log severity: ${severity}.`);
        }
        return;
      }
      if (messageVerbosity < currentVerbosity) {
        return;
      }
      if (prefix) {
        args.unshift(`[${prefix}]`);
      }
      if (typeof console[severity] === "function") {
        console[severity](...args);
        return;
      }
      console.log(...args);
    };
    return {
      info: (...args) => printMessage("info", ...args),
      warn: (...args) => printMessage("warn", ...args),
      error: (...args) => printMessage("error", ...args),
      debugLog: (...args) => printMessage("debug", ...args)
    };
  }
  class PxUserEvent extends Event {
    constructor(name, ...payload) {
      super(name, { bubbles: true, composed: true, cancelable: true });
      payload.forEach((arg) => {
        if (typeof arg === "object" && arg !== null) {
          Object.assign(this, arg);
          return;
        }
      });
    }
  }
  function emitter(element) {
    const listeners = {};
    const on = (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    };
    const off = (event, callback) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    };
    const emit = (event, ...args) => {
      if (listeners[event]) {
        listeners[event].forEach((callback) => callback(...args));
      }
      const ev = new PxUserEvent(event, ...args);
      element.dispatchEvent(ev);
      return ev;
    };
    return { on, off, emit };
  }
  function createWidgetElement(widgetName, customElementName = void 0, baseClass = PxUserBaseWidget) {
    const elementName = customElementName || `px-user-${widgetName}`;
    console.log(elementName);
    if (customElements.get(elementName) !== void 0) {
      return;
    }
    class Widget extends baseClass {
    }
    Widget.widgetName = widgetName;
    customElements.define(elementName, Widget);
  }
  function createCustomElement(customElementName, elementClass) {
    if (customElements.get(customElementName) !== void 0) {
      return;
    }
    customElements.define(customElementName, elementClass);
  }
  class PxUserLogin extends PxUserBaseWidget {
    constructor() {
      super(...arguments);
      // The name of the event to emit on successful login
      __publicField(this, "successEventName", "login");
    }
    /**
     * Configure the widget with the necessary options.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLogin
     */
    configureWidget(config) {
      config.icons = {
        togglePassword: {
          password: true
        }
      };
      if (this.config("showLoginWithEip", false)) {
        config.showLoginWithEip = true;
        config.state = "1234567890";
        config.client_id = "abc123";
        config.eipLoginRedirectUri = this.getRedirectUri();
      }
      return config;
    }
    getRedirectUri() {
      var _a2;
      if (!((_a2 = window.location) == null ? void 0 : _a2.origin)) {
        return "";
      }
      return window.location.origin;
    }
  }
  __publicField(PxUserLogin, "widgetName", "login");
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
    }
    initUserModule(module) {
      this.module = new module({
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
      console.log(error);
      this.resetMessages();
      if (error.validation_code === 200) {
        return;
      }
      let text = error.message ?? error;
      console.log(text);
      if (typeof text !== "string") {
        text = null;
        console.error(error);
      }
      console.log(this.errorMessageElem);
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
        window.dispatchEvent(
          new CustomEvent("px-user-success", {
            detail: data
          })
        );
      }
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
      `${this.appUrl}/api/v1/activation-code`;
      this.module.showActivateUserByActivationCodeForm({
        token: this.token,
        showPasswordRules: true,
        fallbackButtonText: "Activate User",
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
      window.dispatchEvent(
        new CustomEvent("px-user-activated", {
          detail: response.response
        })
      );
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
  class PxUserTokenWidget extends PxUserBaseWidget {
    /**
     * Configure the widget with the necessary options.
     *
     * @param {*} config
     * @return {*}
     * @memberof PxUserLogin
     */
    configureWidget(config) {
      const token = this.config("token");
      console.log(
        `Configuring ${this.constructor.widgetName} with token:`,
        token
      );
      if (!token) {
        throw new Error(
          `Token is required for ${this.constructor.widgetName}`
        );
      }
      config.token = token;
      return config;
    }
  }
  createCustomElement("px-user-login", PxUserLogin);
  createWidgetElement("password-forgot", "px-user-forgot-password");
  createWidgetElement("activate-user", void 0, PxUserTokenWidget);
  if (customElements.get("px-user-set-password") === void 0) {
    customElements.define("px-user-set-password", PxUserSetPassword);
  }
  if (customElements.get("px-user-activate-user-and-login") === void 0) {
    customElements.define(
      "px-user-activate-user-and-login",
      PxUserActivateUserAndLogin
    );
  }
  if (customElements.get("px-user-activate-user-with-activation-code") === void 0) {
    customElements.define(
      "px-user-activate-user-with-activation-code",
      PxUserActivateUserWithActivationCode
    );
  }
  if (customElements.get(
    "px-user-set-password-by-forgot-password-code-and-login"
  ) === void 0) {
    customElements.define(
      "px-user-set-password-by-forgot-password-code-and-login",
      PxUserSetPasswordByForgotPasswordCodeAndLogin
    );
  }
  if (customElements.get("px-user-confirm-email") === void 0) {
    customElements.define("px-user-confirm-email", PxUserConfirmEmail);
  }
  if (customElements.get("px-user-eip-config") === void 0) {
    customElements.define("px-user-eip-config", PxUserEipConfig);
  }
}));
