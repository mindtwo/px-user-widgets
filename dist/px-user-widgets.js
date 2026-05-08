var __create = Object.create;
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
    this.toggleMessageElement("error", false);
    if (this.shouldShowSuccessMessage() && event.message) {
      this.displayMessage("success", event.message);
    }
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
  shouldShowSuccessMessage() {
    return this.constructor.showSuccessMessage || this.showSuccessMessage;
  }
}
_init = __decoratorStart(_a);
PxUserBaseWidget = __decorateElement(_init, 0, "PxUserBaseWidget", _PxUserBaseWidget_decorators, PxUserBaseWidget);
/**
 * Show success message after successful operation.
 */
__publicField(PxUserBaseWidget, "showSuccessMessage", true);
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
function createWidgetElement(widgetName, customElementName = void 0, baseClass = PxUserBaseWidget, decorator = void 0) {
  const elementName = customElementName || `px-user-${widgetName}`;
  if (customElements.get(elementName) !== void 0) {
    return;
  }
  baseClass = baseClass || PxUserBaseWidget;
  class Widget extends baseClass {
  }
  Widget.widgetName = widgetName;
  if (decorator && typeof decorator === "function") {
    decorator(Widget);
  }
  customElements.define(elementName, Widget);
}
function createCustomElement(customElementName, elementClass) {
  if (customElements.get(customElementName) !== void 0) {
    return;
  }
  customElements.define(customElementName, elementClass);
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
    if (!token) {
      throw new Error(
        `Token is required for ${this.constructor.widgetName}`
      );
    }
    config.token = token;
    return config;
  }
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
/**
 * Show success message after successful operation.
 */
__publicField(PxUserLogin, "showSuccessMessage", false);
const DEFAULT_VERIFIER_KEY = "px-oidc-verifier";
const DEFAULT_STATE_KEY = "px-oidc-state";
const _PxUserLoginOidc = class _PxUserLoginOidc extends PxUserBaseWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "successEventName", "login");
    __publicField(this, "_generatedChallenge", null);
    __publicField(this, "_generatedState", null);
  }
  /**
   * If no code_challenge was supplied, generate a PKCE pair + state and
   * persist verifier/state in sessionStorage so the callback page can
   * complete the token exchange.
   */
  async mountIFrame() {
    if (!this.config("codeChallenge")) {
      const { verifier, state, challenge } = await _PxUserLoginOidc.generatePkce();
      sessionStorage.setItem(this.verifierStorageKey, verifier);
      sessionStorage.setItem(this.stateStorageKey, state);
      this._generatedChallenge = challenge;
      this._generatedState = state;
    }
    super.mountIFrame();
  }
  /**
   * Configure the OIDC widget per the Authorization Code + PKCE flow.
   *
   * @param {*} config
   * @return {*}
   * @memberof PxUserLoginOidc
   */
  configureWidget(config) {
    config.icons = {
      togglePassword: {
        password: true
      }
    };
    config.response_type = this.config("responseType", "code");
    config.client_id = this.config("clientId");
    config.redirect_uri = this.config("redirectUri", this.getRedirectUri());
    config.code_challenge = this.config("codeChallenge") ?? this._generatedChallenge;
    config.code_challenge_method = this.config(
      "codeChallengeMethod",
      "S256"
    );
    const state = this.config("state") ?? this._generatedState;
    if (state) {
      config.state = state;
    }
    config.scope = this.config("scope", "openid");
    const prompt = this.config("prompt");
    if (prompt) {
      config.prompt = prompt;
    }
    const logoUrl = this.config("logoUrl");
    if (logoUrl) {
      config.logo_url = logoUrl;
    }
    const faviconUrl = this.config("faviconUrl");
    if (faviconUrl) {
      config.favicon_url = faviconUrl;
    }
    const formTitle = this.config("formTitle");
    if (formTitle) {
      config.form_title = formTitle;
    }
    const showSpinner = this.config("showSpinner");
    if (showSpinner !== void 0) {
      config.show_spinner = showSpinner;
    }
    if (this.config("showLoginWithEip", false)) {
      config.showLoginWithEip = true;
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
  get verifierStorageKey() {
    return this.config("verifierStorageKey", DEFAULT_VERIFIER_KEY);
  }
  get stateStorageKey() {
    return this.config("stateStorageKey", DEFAULT_STATE_KEY);
  }
  /**
   * Generate a PKCE verifier/challenge pair and a random state value.
   *
   * @return {Promise<{verifier: string, challenge: string, state: string}>}
   */
  static async generatePkce() {
    const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
    const verifier = base64UrlEncode(rand(32));
    const state = base64UrlEncode(rand(16));
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(verifier)
    );
    return {
      verifier,
      state,
      challenge: base64UrlEncode(new Uint8Array(digest))
    };
  }
  /**
   * Read the persisted verifier + state from sessionStorage. Use this on
   * your OIDC callback page to complete the token exchange.
   *
   * @param {{verifierKey?: string, stateKey?: string, consume?: boolean}} [options]
   * @return {{verifier: string|null, state: string|null}}
   */
  static readPkce({
    verifierKey = DEFAULT_VERIFIER_KEY,
    stateKey = DEFAULT_STATE_KEY,
    consume = true
  } = {}) {
    const verifier = sessionStorage.getItem(verifierKey);
    const state = sessionStorage.getItem(stateKey);
    if (consume) {
      sessionStorage.removeItem(verifierKey);
      sessionStorage.removeItem(stateKey);
    }
    return { verifier, state };
  }
};
__publicField(_PxUserLoginOidc, "widgetName", "login-oidc");
__publicField(_PxUserLoginOidc, "showSuccessMessage", false);
let PxUserLoginOidc = _PxUserLoginOidc;
function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
class PxUserActivateUserWithActivationCode extends PxUserBaseWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "successEventName", "activated");
  }
  /**
   * Configure the widget with the necessary options.
   *
   * @param {*} config
   * @return {*}
   * @memberof PxUserLogin
   */
  configureWidget(config) {
    config.token = this.config("token");
    config.showPasswordRules = true;
    config.onSuccessActivationCode = (response) => this.displayMessage("success", response.message);
    config.onErrorActivationCode = (error) => this.displayMessage("error", error.message);
    return config;
  }
}
__publicField(PxUserActivateUserWithActivationCode, "widgetName", "activate-user-by-activation-code");
class PxUserActivateUserAndLogin extends PxUserBaseWidget {
  constructor() {
    super(...arguments);
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
    config.token = this.config("token");
    config.showPasswordRules = true;
    config.icons = {
      togglePassword: {
        passwordOne: true,
        passwordTwo: true
      }
    };
    return config;
  }
}
__publicField(PxUserActivateUserAndLogin, "widgetName", "activate-user-login");
class PxUserSetPasswordByForgotPasswordCodeAndLogin extends PxUserBaseWidget {
  constructor() {
    super(...arguments);
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
    config.token = this.config("token");
    config.showPasswordRules = true;
    config.icons = {
      togglePassword: {
        passwordOne: true,
        passwordTwo: true
      }
    };
    return config;
  }
}
__publicField(PxUserSetPasswordByForgotPasswordCodeAndLogin, "widgetName", "password-set-by-forgot-password-code-login");
class PxUserSetPassword extends PxUserBaseWidget {
  /**
   * Configure the widget with the necessary options.
   *
   * @param {*} config
   * @return {*}
   * @memberof PxUserLogin
   */
  configureWidget(config) {
    config.token = this.config("token");
    config.showPasswordRules = true;
    config.icons = {
      togglePassword: {
        passwordOne: true,
        passwordTwo: true
      }
    };
    return config;
  }
}
__publicField(PxUserSetPassword, "widgetName", "password-set");
class PxUserEipConfig extends PxUserBaseWidget {
  /**
   * Configure the widget with the necessary options.
   *
   * @param {*} config
   * @return {*}
   * @memberof PxUserLogin
   */
  configureWidget(config) {
    config.token = this.config("token");
    config.onSuccess = (response) => {
    };
    return config;
  }
  /**
   * Handle success
   *
   * @param response
   */
  showSuccess(response) {
    const data = response.data ?? {};
    if (data.success) {
      this.toggleMessageElement("error", false);
      this.displayMessage("success", data.message);
      window.dispatchEvent(
        new CustomEvent("px-user-eip-config-success", {
          detail: response
        })
      );
    }
  }
}
__publicField(PxUserEipConfig, "widgetName", "eip-config");
createCustomElement("px-user-login", PxUserLogin);
createCustomElement("px-user-oidc", PxUserLoginOidc);
createWidgetElement("password-forgot", "px-user-forgot-password");
createWidgetElement("activate-user", void 0, PxUserTokenWidget);
createCustomElement(
  "px-user-activate-user-and-login",
  PxUserActivateUserAndLogin
);
createCustomElement(
  "px-user-activate-user-with-activation-code",
  PxUserActivateUserWithActivationCode
);
createCustomElement(
  "px-user-set-password-by-forgot-password-code-and-login",
  PxUserSetPasswordByForgotPasswordCodeAndLogin
);
createWidgetElement(
  "confirm-new-email",
  "px-user-confirm-email",
  PxUserTokenWidget
);
createCustomElement("px-user-set-password", PxUserSetPassword);
createCustomElement("px-user-eip-config", PxUserEipConfig);
