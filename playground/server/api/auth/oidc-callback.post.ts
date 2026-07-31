import { z } from 'zod'

/**
 * Completes the Authorization Code + PKCE flow for **both** modes the index
 * page offers, and is the only place `client_secret` is read.
 *
 * Which mode we're in is decided by who holds the verifier:
 *
 *  - "Auth as a Service": we minted it in /api/auth/authorize and it sits in the
 *    sealed session. We validate `state` here, server-side.
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

export default defineEventHandler(async (event) => {
    const { code, state, code_verifier: postedVerifier } = await readValidatedBody(
        event,
        bodySchema.parse,
    )

    const session = await getUserSession(event)
    const pending = session.secure?.pendingOidc

    let codeVerifier: string
    let mode: 'service' | 'widget'

    if (pending) {
        mode = 'service'

        // Single use: a replayed callback must not succeed. Drop it before any
        // validation so an early return can't leave it usable.
        await setUserSession(event, { secure: { ...session.secure, pendingOidc: undefined } })

        if (Date.now() - pending.createdAt > PENDING_TTL_MS) {
            throw createError({ statusCode: 400, statusMessage: 'Login request expired — start again' })
        }

        if (!state || state !== pending.state) {
            throw createError({
                statusCode: 400,
                statusMessage: 'OIDC state mismatch — possible CSRF, aborted',
            })
        }

        codeVerifier = pending.verifier
    }
    else {
        mode = 'widget'

        if (!postedVerifier) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    'No PKCE verifier. In widget mode the callback page must send the one it '
                    + 'read from sessionStorage; in service mode the server-side request expired.',
            })
        }

        codeVerifier = postedVerifier
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
