import { parseHtml } from '../helper/parse-html';

export class UserComponent extends HTMLElement {
    constructor() {
        super();
    }

    getAttrValues() {
        this.containerId = this.getAttribute('data-containerId') ?? this.widget;
        this.token = this.getAttribute('data-token');
        this.appUrl = this.getAttribute('data-app-url');
        this.language = this.getAttribute('data-language');

        this.cssPath = this.getAttribute('data-css-path') ?? 'storage/assets/css/px-user.css';

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

        this.errorMessageElem = parseHtml(`<span id="${this.containerId}-error" class="error-message" style="display: none;"></span>`);
        wrapper.append(this.errorMessageElem);

        this.successMessageElem = parseHtml(`<span id="${this.containerId}-success" class="success-message" style="display: none;"></span>`);
        wrapper.append(this.successMessageElem);

        this.module[`${this.widget}`](this.config);
    }

    /**
     * Reset messages to empty string
     */
    resetMessages() {
        this.errorMessage = '';
        this.successMessage = '';
    }

    /**
     * Error handler
     * Shows error message in notification
     *
     * @param error
     */
    handleError(error) {
        this.resetMessages();

        this.errorMessage = error.message;
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
            this.successMessage = data.message;

            window.dispatchEvent(new CustomEvent('px-user-success', {
                detail: data,
            }));
        }
    }

    /**
     * Get the fallback target url
     * @returns {string}
     */
    getFallbackTargetUrl() {
        return this.fallbackTarget.startsWith('/') ?  `${this.appUrl}${this.fallbackTarget}` : `${this.appUrl}/${this.fallbackTarget}`;
    }

    set errorMessage(message) {
        if (!this.errorMessageElem) {
            return;
        }
        this.errorMessageElem.textContent = message;
    }

    set successMessage(message) {
        if (!this.successMessageElem) {
            return;
        }
        this.successMessageElem.textContent = message;
    }

    /**
     * Get css url
     */
    get cssUrl() {
        if(this.cssPath.startsWith('http://') || this.cssPath.startsWith('https://') || this.cssPath.startsWith('//')) {
            return this.cssPath;
        }

        return `${this.appUrl}/${this.cssPath}`;
    }

    /**
     * Get widget which we want to mount
     */
    get widget() {
        throw new Error('Override widget getter in your class');
    }

    /**
     * Get fallbackTargetPath
     */
    get fallbackTarget() {
        throw new Error('Override fallbackTarget getter in your class');
    }

    /**
     * Get config. When overriding this, make sure to merge the config with the super.config
     */
    get config() {
        return {
            containerElement: this.containerId,
            cssUrl: this.cssUrl,
            fallbackTargetUrl: this.getFallbackTargetUrl(),

            onSuccess: (response) => this.handleSuccess(response),
            onError: (error) => this.handleError(error),
        };
    }
}
