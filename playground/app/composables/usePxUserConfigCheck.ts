export interface MissingPxUserConfig {
    /** The attribute the widget expects. */
    attribute: string;
    envVar: string;
    purpose: string;
}

/**
 * `tenant`, `domain` and `clientId` are required — every widget needs them and
 * none of them has a usable default.
 *
 * Without them the failure is misleading rather than obvious: the widget still
 * mounts, renders the attribute as the literal string "undefined", and the IdP
 * answers `invalid_client: Client ID "undefined" not found`. Catching it here
 * turns that into a message that names the env var to set.
 */
export function usePxUserConfigCheck() {
    const { pxUser } = useRuntimeConfig().public;

    const missing = computed<MissingPxUserConfig[]>(() =>
        [
            {
                attribute: 'tenant',
                envVar: 'NUXT_PUBLIC_PX_USER_TENANT',
                purpose: 'Tenant code, e.g. vnr',
                value: pxUser.tenant,
            },
            {
                attribute: 'domain',
                envVar: 'NUXT_PUBLIC_PX_USER_DOMAIN',
                purpose: 'Domain code, e.g. px_teach',
                value: pxUser.domain,
            },
            {
                attribute: 'data-client-id',
                envVar: 'NUXT_PUBLIC_PX_USER_CLIENT_ID',
                purpose: 'OIDC client id from your registration',
                value: pxUser.clientId,
            },
        ]
            .filter((entry) => !entry.value?.trim())
            .map(({ attribute, envVar, purpose }) => ({
                attribute,
                envVar,
                purpose,
            })),
    );

    const isConfigured = computed(() => missing.value.length === 0);

    return { missing, isConfigured };
}
