/**
 * Ends the session. Tells px-user first, but a failure there must never leave
 * the user stuck in a session they asked to end.
 */
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    const accessToken = session.secure?.accessToken

    let remoteLogout: 'ok' | 'failed' | 'skipped' = 'skipped'

    if (accessToken) {
        try {
            await pxUserLogout(accessToken)
            remoteLogout = 'ok'
        }
        catch (error) {
            remoteLogout = 'failed'
            console.warn('[px-user] remote logout failed, clearing local session anyway', error)
        }
    }

    await clearUserSession(event)

    return { remoteLogout }
})
