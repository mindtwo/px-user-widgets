/**
 * Fresh profile for the dashboard, straight from px-user rather than from the
 * session snapshot — so the card shows what the API returns right now.
 *
 * Returns the raw payload on purpose: seeing the real field names is more useful
 * here than a tidy DTO.
 */
export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)

    const accessToken = session.secure?.accessToken

    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: 'Session has no access token' })
    }

    try {
        const profile = await fetchPxUserWithPermissions(accessToken)

        return { source: '/v1/user-with-permissions', profile }
    }
    catch (error) {
        const status = (error as { status?: number }).status

        // An expired or revoked token should end the session rather than render
        // a broken dashboard forever.
        if (status === 401) {
            await clearUserSession(event)

            throw createError({ statusCode: 401, statusMessage: 'px-user rejected the access token' })
        }

        // Some tenants don't expose the permissions variant — fall back so the
        // dashboard still works.
        const profile = await fetchPxUser(accessToken)

        return { source: '/v1/user', profile }
    }
})
