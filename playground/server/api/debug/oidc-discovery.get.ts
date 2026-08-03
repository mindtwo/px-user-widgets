/**
 * Returns the OIDC discovery document (public by definition) plus the derived
 * values the playground will use. Hit this first when something doesn't work —
 * a wrong NUXT_PX_USER_CONTEXT or host shows up here immediately, before any UI
 * is involved.
 */
export default defineEventHandler(async (event) => {
    const { pxUser } = useRuntimeConfig(event)
    const { pxUser: publicPxUser } = useRuntimeConfig(event).public

    const config = {
        oidcHost: pxUser.oidcHost,
        apiHost: pxUser.apiHost,
        context: pxUser.context || null,
        // Presence only — never the value.
        authorizationUrlSet: Boolean(pxUser.authorizationUrl),
        clientId: publicPxUser.clientId || null,
        tenant: publicPxUser.tenant || null,
        domain: publicPxUser.domain || null,
        scope: publicPxUser.scope,
        redirectUri: pxUserRedirectUri(),
    }

    try {
        const discovery = await discoverOidc(true)

        return { ok: true, config, discovery }
    }
    catch (error) {
        return {
            ok: false,
            config,
            error: (error as { statusMessage?: string; message?: string }).statusMessage
                ?? (error as Error).message,
            data: (error as { data?: unknown }).data,
        }
    }
})
