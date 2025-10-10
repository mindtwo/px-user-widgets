import { PxUserBaseWidget } from '../base/px-user-base-widget';

/**
 * Create html element from string
 *
 * @param {string} htmlString
 * @returns {ChildNode}
 */
export function parseHtml(htmlString) {
    try {
        const dom = new DOMParser().parseFromString(htmlString, 'text/html');
        return dom.body.firstChild;
    } catch (error) {
        console.log('Error parsing HTML string:', error);
    }
}

/**
 * Wait for an object to be available in the window scope.
 * This is useful for waiting for dynamically loaded modules.
 *
 * @param {string} name - The name of the object to wait for.
 * @returns {Promise} - A promise that resolves when the object is available.
 */
export function waitForObject(name) {
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            if (window[name]) {
                clearInterval(intervalId);
                resolve(window[name]);
            }
        }, 100); // Check every 100 milliseconds for availability of thatObject
    });
}

/**
 * Logger utility to log messages to the console.
 * It provides methods for different log levels: info, warn, error, and debugLog.
 *
 * @param {string} [prefix=''] - A prefix to prepend to each log message.
 * @param {string} [verbosity='info'] - The minimum log level to display.
 *
 * @returns {Object} - An object with logging methods.
 */
export function logger(prefix = '', verbosity = 'info') {
    if (!window?.console) {
        return {};
    }

    const severities = {
        debug: 1,
        info: 10,
        warn: 20,
        error: 30,
    };

    // The verbosity level determines which messages are logged.
    const currentVerbosity = severities[verbosity] || severities.info;

    if (currentVerbosity === 1) {
        console.log(
            `Logger initialized with prefix: ${prefix} and verbosity: ${verbosity}`,
        );
    }

    const printMessage = (severity = 'info', ...args) => {
        const messageVerbosity = severities[severity];

        // Check if the severity is valid
        if (!messageVerbosity) {
            if (currentVerbosity === 1) {
                // If the severity is invalid, log a warning on debug and return
                console.warn(`Invalid log severity: ${severity}.`);
            }

            return;
        }

        if (messageVerbosity < currentVerbosity) {
            // If the message's severity is lower than the current verbosity, skip logging
            return;
        }

        if (prefix) {
            // Prepend the prefix to the log message
            args.unshift(`[${prefix}]`);
        }

        if (typeof console[severity] === 'function') {
            console[severity](...args);
            return;
        }

        console.log(...args);
    };

    return {
        info: (...args) => printMessage('info', ...args),
        warn: (...args) => printMessage('warn', ...args),
        error: (...args) => printMessage('error', ...args),
        debugLog: (...args) => printMessage('debug', ...args),
    };
}

class PxUserEvent extends Event {
    constructor(name, ...payload) {
        super(name, { bubbles: true, composed: true, cancelable: true });

        payload.forEach((arg) => {
            if (typeof arg === 'object' && arg !== null) {
                // If the argument is an object, add it to the event as a property
                Object.assign(this, arg);
                return;
            }
        });
    }
}

/**
 * Emitter utility to handle custom events.
 * It allows you to register event listeners, remove them, and emit events.
 *
 * @param {HTMLElement} element - The element to attach the emitter to.
 * @returns {Object} - An object with methods to manage event listeners.
 */
export function emitter(element) {
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
            // Call all registered callbacks for the event
            listeners[event].forEach((callback) => callback(...args));
        }

        // Dispatch a custom event for the window
        const ev = new PxUserEvent(event, ...args);
        // Dispatch the event on the provided element
        element.dispatchEvent(ev);

        return ev;
    };

    return { on, off, emit };
}

/**
 * Function to create a custom element with a given name and base class.
 * If a custom element with the specified name already exists, it will not be registered again.
 * @param {string} widgetName - The name of the custom element.
 * @param {string} [customElementName] - Optional custom element name, defaults to `px-user-${name}`.
 * @param {class} [baseClass=PxUserBaseWidget] - The base class to extend for the custom element.
 * @param {function} [decorator] - Optional decorator function to modify the class before defining it.
 */
export function createWidgetElement(
    widgetName,
    customElementName = undefined,
    baseClass = PxUserBaseWidget,
    decorator = undefined,
) {
    const elementName = customElementName || `px-user-${widgetName}`;

    // check if element exists and register if not
    if (customElements.get(elementName) !== undefined) {
        return;
    }

    // Ensure the base class is defined
    baseClass = baseClass || PxUserBaseWidget;

    // Create a new class that extends the base class
    class Widget extends baseClass {}
    Widget.widgetName = widgetName;

    if (decorator && typeof decorator === 'function') {
        // Apply the decorator function to the class
        decorator(Widget);
    }

    customElements.define(elementName, Widget);
}

/**
 * Function to create a custom element with a given name and class.
 * If a custom element with the specified name already exists, it will not be registered again.
 * @param {string} customElementName - The name of the custom element to create.
 * @param {class} elementClass - The class to use for the custom element.
 */
export function createCustomElement(customElementName, elementClass) {
    // check if element exists and register if not
    if (customElements.get(customElementName) !== undefined) {
        return;
    }

    // Define the custom element with the provided class
    customElements.define(customElementName, elementClass);
}
