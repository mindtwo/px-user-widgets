import { parseHtml } from '../helper';

export class UserComponent extends HTMLElement {
    constructor() {
        super();
    }

    getAttrValues() {
        this.containerId = this.getAttribute('data-containerId') ?? this.getContainerId();
        this.token = this.getAttribute('data-token');
        this.appUrl = this.getAttribute('data-app-url');
        this.language = this.getAttribute('data-language');

        this.cssPath = this.getAttribute('data-css-path') ?? 'storage/assets/css/px-user.css';

        this.labels = JSON.parse(this.getAttribute('data-labels')) ?? {};

        this.module = new PxModUser({
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

        this.mountIFrame();

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

        this.errorMessageElem.textContent = error.message;
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
