import type { UserSession } from '#auth-utils'
import type { H3Event } from 'h3'
import { z } from 'zod'

/**
 * Completes the Authorization Code + PKCE flow for **both** modes the index
 * page offers.
 *
 * Which mode we're in is decided by `state` — the value that correlates a
 * callback with the request that started it — not by who happens to hold a
 * verifier. Both records can exist at once: the widget writes a PKCE pair into
 * sessionStorage on every mount of the sign-in page, and a service attempt that
 * was never completed leaves its `pendingOidc` behind.
 *
 *  - "Auth as a Service": we minted it in /api/auth/authorize and it sits in the
 *    sealed session. The callback matches its `state`, and we validate that here.
 *  - "Direct widget login": the widget generated it into sessionStorage, and the
 *    callback page already validated `state` against it before posting.
 *
 * The authorization code has a 5 second TTL, so this handler does the exchange
 * inline with no retries.
 */

const bodySchema = z.object({
    code: z.string().min(1),
    state: z.string().optional(),
    /** Widget mode only — read from sessionStorage by the callback page. */
    code_verifier: z.string().min(1).optional(),
})

/** Matches the widget's 10 minute pending-request TTL. */
const PENDING_TTL_MS = 10 * 60 * 1000

/**
 * Delete the service-mode PKCE record from the session.
 *
 * Not `setUserSession(…, { secure: { pendingOidc: undefined } })`: that merges
 * with `defu`, which skips `undefined` keys, so the record survives every such
 * attempt and stays in the session for as long as the browser keeps the cookie.
 * The whole session has to be rewritten for the deletion to take.
 */
async function dropPendingOidc(event: H3Event, session: UserSession) {
    const { pendingOidc, ...secure } = session.secure ?? {}

    await replaceUserSession(event, { ...session, secure })
}

export default defineEventHandler(async (event) => {
    const { code, state, code_verifier: postedVerifier } = await readValidatedBody(
        event,
        bodySchema.parse,
    )

    const session = await getUserSession(event)
    const pending = session.secure?.pendingOidc

    let codeVerifier: string
    let mode: 'service' | 'widget'

    if (pending && state && state === pending.state) {
        mode = 'service'

        // Single use: a replayed callback must not succeed. Drop it before any
        // validation so an early return can't leave it usable.
        await dropPendingOidc(event, session)

        if (Date.now() - pending.createdAt > PENDING_TTL_MS) {
            throw createError({ statusCode: 400, statusMessage: 'Login request expired — start again' })
        }

        codeVerifier = pending.verifier
    }
    else if (postedVerifier) {
        mode = 'widget'

        // A `pendingOidc` from an abandoned service attempt may still be in the
        // session. It is not what came back here — the `state` above proved
        // that — so it must not hijack this login. `replaceUserSession` at the
        // end drops it; leaving it until then keeps a service request that is
        // genuinely still in flight elsewhere usable.
        codeVerifier = postedVerifier
    }
    else if (pending) {
        // A service request is pending, but this callback carries neither its
        // `state` nor a verifier of its own — nothing here belongs to it.
        await dropPendingOidc(event, session)

        throw createError({
            statusCode: 400,
            statusMessage: 'OIDC state mismatch — possible CSRF, aborted',
        })
    }
    else {
        throw createError({
            statusCode: 400,
            statusMessage:
                'No PKCE verifier. In widget mode the callback page must send the one it '
                + 'read from sessionStorage; in service mode the server-side request expired.',
        })
    }

    const tokens = await exchangeAuthorizationCode({ code, codeVerifier })

    const user = await fetchPxUser(tokens.access_token)

    const maxAge = tokens.expires_in && tokens.expires_in > 0 ? tokens.expires_in : undefined
    const expiresAt = maxAge ? new Date(Date.now() + maxAge * 1000).toISOString() : undefined

    // replaceUserSession, not setUserSession: drops any leftover pendingOidc
    // rather than merging it forward.
    await replaceUserSession(
        event,
        {
            user,
            loggedInAt: Date.now(),
            expiresAt,
            loginMode: mode,
            secure: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            },
        },
        maxAge ? { maxAge } : undefined,
    )

    return { mode, expiresAt, scope: tokens.scope, hasRefreshToken: Boolean(tokens.refresh_token) }
})
