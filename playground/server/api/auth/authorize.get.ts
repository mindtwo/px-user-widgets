/**
 * "Auth as a Service" entry point.
 *
 * We are the relying party here: no widget is involved. We mint the PKCE pair
 * server-side, keep the verifier in the sealed session cookie, and bounce the
 * browser to the hosted login host. Nothing sensitive leaves the server except
 * the challenge, which is what PKCE is for.
 *
 * See ../../../../docs/oidc-external-app-integration.md §4.1.
 */
export default defineEventHandler(async (event) => {
    const { authorizationUrl } = useRuntimeConfig(event).pxUser

    if (!authorizationUrl) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Auth as a Service is not configured. Set NUXT_PX_USER_AUTHORIZATION_URL '
                + 'in playground/.env to the hosted login host you were given.',
        })
    }

    const { url, verifier, state } = buildAuthorizationUrl()

    // Bound to this browser session — never to a global or a guessable cache key.
    await setUserSession(event, {
        secure: { pendingOidc: { verifier, state, createdAt: Date.now() } },
    })

    return sendRedirect(event, url, 302)
})
