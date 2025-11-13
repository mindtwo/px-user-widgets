import camelCase from 'just-camel-case';
import capitalize from 'just-capitalize';
import { logger, parseHtml, waitForObject, emitter } from '../helper';

function WithLogger(target) {
    // Initialize logger
    const verbosity = window.PX_WIDGETS_VERBOSITY || 'warn';
    Object.assign(target.prototype, logger('PX-User Widgets', verbosity));
}
/**
 * Base class for PX User Widgets.
 *
 * @export
 * @class PxUserBaseWidget
 * @extends {HTMLElement}
 */
@WithLogger
export class PxUserBaseWidget extends HTMLElement {
    /**
     * Configuration object for the widget.
     * This is used to store the configuration values from the element attributes.
     */
    _config = {};

    /**
     * List of configuration keys that are allowed to be set via attributes.
     * This list indicates prefix data- is not needed.
     *
     * @type {string[]}
     */
    configKeys = ['stage', 'tenant', 'domain'];

    /**
     * The root container element for the widget.
     * This is used to mount the iframe and display messages.
     */
    _root = null;

    /**
     * Message elements used to display success and error messages.
     */
    _successMessageEl = null;
    _errorMessageEl = null;

    /**
     * Show success message after successful operation.
     */
    static showSuccessMessage = true;

    /**
     * The name of the widget, used for identification.
     * This should be set in the subclass.
     * @type {string}
     */
    // static widgetName = '';

    constructor() {
        super();

        // print debug message
        this.debugLog('widget created');
    }

    /**
     * Mount iframe to our wrapper element.
     * This should use a the function from PxUserModule
     */
    mountIFrame() {
        // Get the widget name from the subclass
        const widgetName = this.constructor.widgetName;

        if (!widgetName) {
            this.error(
                '[PX-User Widgets]: No widgetName set, cannot mount iframe',
            );
            return;
        }

        // Fallback target URL, if not set in config
        const fallbackTargetUrl = this.config(
            'fallbackTargetUrl',
            `${this.appUrl}/api/v2/${widgetName}`,
        );

        // Fallback button text, if not set in config
        const fallbackButtonText = this.config(
            'fallbackButtonText',
            capitalize(widgetName.replace('-', ' ')),
        );

        // Create configuration object for the module
        let config = {
            containerElement: this.containerId,
            fallbackTargetUrl,
            fallbackButtonText,
            cssUrl: this.cssUrl,
            onSuccess: (response) => this.onSuccess(response),
            onError: (response) => this.onError(response),
        };

        if (typeof this.configureWidget === 'function') {
            // If the subclass has a configureWidget method, call it to allow further customization
            const c = this.configureWidget(config);

            config = c;
        }

        this.info('mountIFrame', 'Mounting iframe with config:', config);

        const formMethod = camelCase(['show', widgetName, 'form'].join('-'));

        // Call the module's method to show the form
        this.module[formMethod](config);
    }

    /**
     * Executed when the element is mounted
     */
    connectedCallback() {
        this.debugLog('connectedCallback', this.containerId, this._config);

        // Emitter and config initialization
        this.events = emitter(this);
        this.loadConfig();

        // Create root  element
        this.createRootElement();
        // Create message elements for success and error messages
        this.createMessageElements();

        // Wait for PxUserModule to be loaded
        waitForObject('PxModUser').then((module) => {
            this.initUserModule(module);

            this.mountIFrame();

            this.events.emit('mounted');
        });
    }

    /**
     * Create the root element for the widget.
     * This is used to mount the iframe and display messages.
     */
    // eslint-disable-next-line class-methods-use-this
    createRootElement() {
        // Create the root element for the widget
        this._root = parseHtml(
            `<div id="${this.containerId}" class="user-component"></div>`,
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
            stage: this.config('stage', window.PX_USER_STAGE),
            domain: this.config('domain', window.PX_USER_DOMAIN),
            tenant: this.config('tenant', window.PX_USER_TENANT),
            language: this.config('language', 'de'),
        });
    }

    /**
     * Get container fallback id
     *
     * @returns {string}
     */
    get containerId() {
        return (
            this.config('containerId') ??
            (this.constructor.widgetName
                ? `px-user-widget-${this.constructor.widgetName}`
                : null)
        );
    }

    /**
     * Get the app url
     *
     * @returns {string}
     */
    get appUrl() {
        return this.config('appUrl', window.PX_USER_APP_URL);
    }

    /**
     * Get the css url
     *
     * @returns {string}
     */
    get cssUrl() {
        const cssPath = this.config('cssPath', 'css/px-user.css');

        if (
            cssPath.startsWith('http://') ||
            cssPath.startsWith('https://') ||
            cssPath.startsWith('//')
        ) {
            return cssPath;
        }

        // Else we assume it's a relative path to the app url
        return `${this.appUrl}/${cssPath}`;
    }

    /**
     * Get the config value for the given option name
     *
     * @param optionName
     * @param fallback
     * @returns {*}
     */
    config(optionName, fallback = undefined) {
        if (this._config[optionName] !== undefined) {
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
            // Only load once
            this.info('loadConfig', 'Config already loaded', this._config);

            return;
        }

        for (const attr of this.attributes) {
            // Only load data attributes
            if (
                !attr.name.startsWith('data-') &&
                !this.configKeys.includes(attr.name)
            ) {
                this.debugLog('loadConfig', 'Skipping attribute', attr.name);
                continue;
            }
            // Convert attribute name to camelCase and set the value
            const [opt, modifier] = attr.name.split('_');

            const optionName = camelCase(opt.replace('data-', ''));

            let value = attr.value;
            if (modifier === 'json') {
                try {
                    value = JSON.parse(attr.value);
                } catch (e) {
                    this.warn(
                        `Failed to parse JSON for ${optionName}:`,
                        e,
                        attr.value,
                    );
                }
            }

            this._config[optionName] = value;
        }

        this.debugLog('config loaded for widget');
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
        if (!['success', 'error'].includes(type)) {
            this.warn('can only toggle success or error messages');
            return;
        }

        const messageEl = this[`_${type}MessageEl`];

        let display = '';

        if (state === true) {
            // Toggle the current display state
            display = 'block';
        } else if (state === false) {
            // If state is false, hide the message element
            display = 'none';
        } else {
            // If state is undefined, toggle the visibility
            display = messageEl.style.display === 'none' ? 'block' : 'none';
        }

        if (display === 'none') {
            // If hiding the message, clear the text content
            messageEl.textContent = '';
        }

        // Toggle state
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
        if (!['success', 'error'].includes(type)) {
            this.warn('can only display success or error messages');
            return;
        }

        const messageEl = this[`_${type}MessageEl`];
        // Set the message text
        messageEl.textContent = message;

        // Show the message element
        this.toggleMessageElement(type, true);
    }

    /**
     * Create message elements for success and error messages.
     * This is used to display messages to the user.
     */
    createMessageElements() {
        // create error message element
        const errorMessageElem = parseHtml(
            `<span id="${this.containerId}-error" class="error-message mb-2" style="display: none;"></span>`,
        );
        this.insertBefore(errorMessageElem, this._root);
        this._errorMessageEl = errorMessageElem;

        // create success message element
        const successMessageElem = parseHtml(
            `<span id="${this.containerId}-success" class="success-message mb-2" style="display: none;"></span>`,
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
        // Get the error message from the event
        const errorMessage = event.message ?? 'An error occurred.';

        // Log the error message
        this.error(errorMessage);
        this.displayMessage('error', errorMessage);

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
        this.debugLog('onSuccess', event);

        // Hide the error message if it was previously shown
        this.toggleMessageElement('error', false);

        if (this.shouldShowSuccessMessage() && event.message) {
            // Display the success message if configured to do so
            this.displayMessage('success', event.message);
        }

        this.events.emit(this.getSuccessEventName(), event);
    }

    getSuccessEventName() {
        if (this.constructor.successEventName) {
            return this.constructor.successEventName;
        }

        return this.successEventName || 'success';
    }

    getErrorEventName() {
        if (this.constructor.errorEventName) {
            return this.constructor.errorEventName;
        }

        return this.errorEventName || 'error';
    }

    shouldShowSuccessMessage() {
        return this.constructor.showSuccessMessage || this.showSuccessMessage;
    }
}
