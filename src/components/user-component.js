import { parseHtml } from '../helper';

function waitForObject(name) {
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            if (window[name]) {
                clearInterval(intervalId);
                resolve(window[name]);
            }
        }, 100); // Check every 100 milliseconds for availability of thatObject
    });
}

export class UserComponent extends HTMLElement {
    constructor() {
        super();
    }

    getAttrValues() {
        this.containerId = this.getAttribute('data-containerId') ?? this.getContainerId();
        this.token = this.getAttribute('data-token');
        this.appUrl = this.getAttribute('data-app-url');
        this.language = this.getAttribute('data-language');

        this.showLoginWithEip = this.getAttribute('data-show-login-with-eip') === 'true';

        this.cssPath = this.getAttribute('data-css-path') ?? 'storage/assets/css/px-user.css';

        this.labels = JSON.parse(this.getAttribute('data-labels')) ?? {};
    }

    initUserModule(module) {
        this.module = new module({
            stage: this.getAttribute('stage') ?? window.PX_USER_STAGE,
            domain: this.getAttribute('domain') ?? window.PX_USER_DOMAIN,
            tenant: this.getAttribute('tenant') ?? window.PX_USER_TENANT,
            language: this.language ?? 'de',
        });
    }

    /**
     * Executed when the element is mounted
     */
    connectedCallback() {
        this.getAttrValues();

        // create wrapper to mount iframe
        const wrapper = parseHtml(`<div id="${this.containerId}" class="user-component"></div>`);
        this.append(wrapper);

        // Wait for PxUserModule to be loaded
        waitForObject('PxModUser').then((module) => {
            this.initUserModule(module);

            this.mountIFrame();
        });

        // create error message element
        const errorMessageElem = parseHtml(`<span id="${this.containerId}-error" class="error-message mb-2" style="display: none;"></span>`);
        wrapper.append(errorMessageElem);

        this.errorMessageElem = errorMessageElem;

        // create success message element
        const successMessageElem = parseHtml(`<span id="${this.containerId}-success" class="success-message mb-2" style="display: none;"></span>`);
        wrapper.append(successMessageElem);

        this.successMessageElem = successMessageElem;
    }

    /**
     * Mount iframe to our wrapper element.
     * This should use a the function from PxUserModule
     */
    mountIFrame() {
        console.warn('Override mountIFrame inside your class');
    }

    /**
     * Mount iframe to our wrapper element.
     * This should use a the function from PxUserModule
     */
    getContainerId() {
        console.warn('Either set attribute "data-container-id" on element or override "getContainerId" inside your class');
    }

    resetMessages() {
        this.successMessageElem.textContent = '';
        this.errorMessageElem.textContent = '';

        this.successMessageElem.style.display = 'none';
        this.errorMessageElem.style.display = 'none';
    }

    /**
     * Error handler
     * Shows error message in notification
     *
     * @param error
     */
    handleError(error) {
        this.resetMessages();

        // if validation code is 200, we don't show the error
        if (error.validation_code === 200){
            return;
        }

        let text = error.message ?? error;

        // check if error is an object
        if (typeof text !== 'string') {
            text = null;
            console.error(error);
        }

        this.errorMessageElem.textContent = text ?? 'An error occurred';
        this.errorMessageElem.style.display = 'block';
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
            // remove iframe
            if (removeIFrame) {
                document.querySelector(`#${this.containerId} .px-user-widget`).remove();
            }

            // set our success message
            this.successMessageElem.textContent = data.message;
            this.successMessageElem.style.display = 'block';

            window.dispatchEvent(new CustomEvent('px-user-success', {
                detail: data,
            }));
        }
    }

    get cssUrl() {
        if(this.cssPath.startsWith('http://') || this.cssPath.startsWith('https://') || this.cssPath.startsWith('//')) {
            return this.cssPath;
        }

        return `${this.appUrl}/${this.cssPath}`;
    }
}
