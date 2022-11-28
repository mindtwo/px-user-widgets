export class UserModule {
    /**
     * Create new ModuleUser instance
     */
    constructor() {
        this.id = 0;
        // get global vars from window object
        const stage = window.PX_USER_STAGE;
        const tenant = window.PX_USER_TENANT;
        const domain = window.PX_USER_DOMAIN;

        this.module = new PxModUser({
            stage,
            domain,
            tenant,
            language: 'de'
        });
    }
}
