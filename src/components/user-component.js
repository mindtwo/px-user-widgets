import { parseHtml, waitForObject } from '../helper';

export class UserComponent extends HTMLElement {
    constructor() {
        super();
    }

    getAttrValues() {
        this.containerId =
            this.getAttribute('data-containerId') ?? this.getContainerId();
        this.token = this.getAttribute('data-token');
        this.appUrl = this.getAttribute('data-app-url');
        this.language = this.getAttribute('data-language');

        this.showLoginWithEip =
            this.getAttribute('data-show-login-with-eip') === 'true';

        this.cssPath =
            this.getAttribute('data-css-path') ??
            'storage/assets/css/px-user.css';

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
    connectedCallback() {}

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
        console.log(error);

        this.resetMessages();

        // if validation code is 200, we don't show the error
        if (error.validation_code === 200) {
            return;
        }

        let text = error.message ?? error;

        console.log(text);

        // check if error is an object
        if (typeof text !== 'string') {
            text = null;
            console.error(error);
        }

        console.log(this.errorMessageElem);

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
                document
                    .querySelector(`#${this.containerId} .px-user-widget`)
                    .remove();
            }

            // set our success message
            this.successMessageElem.textContent = data.message;
            this.successMessageElem.style.display = 'block';

            window.dispatchEvent(
                new CustomEvent('px-user-success', {
                    detail: data,
                }),
            );
        }
    }
}
