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
        const wrapper = document.createElement('div');
        wrapper.id = this.containerId;
        wrapper.classList.add('user-component');

        this.append(wrapper);

        const errorMessage = document.createElement('span');
        errorMessage.id = `${this.containerId}-error`;
        wrapper.append(errorMessage);

        const successMessage = document.createElement('span');
        successMessage.id = `${this.containerId}-success`;
        wrapper.append(successMessage);

        this.mountIFrame();
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
        const errorMessage = document.querySelector(`#${this.containerId}-error`);
        const successMessage = document.querySelector(`#${this.containerId}-success`);

        errorMessage.textContent = '';
        errorMessage.classList.remove('error-message', 'mb-2');

        successMessage.textContent = '';
        successMessage.classList.remove('success-message', 'mb-2');
    }

    /**
     * Error handler
     * Shows error message in notification
     *
     * @param error
     */
    handleError(error) {
        this.resetMessages();

        const errorMessage = document.querySelector(`#${this.containerId}-error`);
        errorMessage.textContent = error.message;

        // TODO why are we adding classes here?
        errorMessage.classList.add('error-message');
        errorMessage.classList.add('mb-2');
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
            const successMessage = document.querySelector(`#${this.containerId}-success`);
            successMessage.textContent = data.message;

            // TODO why are we adding classes here?
            successMessage.classList.add('success-message');
            successMessage.classList.add('mb-2');

            window.dispatchEvent(new CustomEvent('px-user-success', {
                detail: data,
            }));
        }
    }

    /**
     * Get request headers for internal and external requests
     * @returns {Object}
     */
    get headers() {
        const base = {
            'Content-Type': 'application/json',
        };

        return base;
    }

    get cssUrl() {
        if(this.cssPath.startsWith('http://') || this.cssPath.startsWith('https://') || this.cssPath.startsWith('//')) {
            return this.cssPath;
        }

        return `${this.appUrl}/${this.cssPath}`;
    }

    /**
     * Send request to backend
     *
     * @param url
     * @param data
     * @returns {Promise<Response>}
     */
    request(url, data = null) {
        const method = data ? 'POST' : 'GET';

        return fetch(url, {
            method,
            redirect: 'follow',
            // credentials: 'include',
            headers: this.headers,
            body: JSON.stringify(data),
        });
    }
}
