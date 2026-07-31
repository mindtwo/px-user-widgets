import { z } from 'zod'

/**
 * Non-OIDC login. Receives the payload a widget emitted on its `login` event —
 * <px-user-login>, <px-user-activate-user-and-login> and
 * <px-user-set-password-by-forgot-password-code-and-login> all produce the same
 * token pair — and turns it into a server session.
 *
 * Only the tokens are required. Everything else is optional and passed through
 * so shape drift shows up in the response instead of as a 500: this is a
 * playground, surfacing the real payload is the point.
 */

const bodySchema = z
    .object({
        access_token: z.string().min(1),
        refresh_token: z.string().min(1).optional(),
        access_token_lifetime_minutes: z.number().optional(),
        access_token_expiration_utc: z.string().optional(),
        refresh_token_lifetime_minutes: z.number().optional(),
        refresh_token_expiration_utc: z.string().optional(),
    })
    .passthrough()

export default defineEventHandler(async (event) => {
    const payload = await readValidatedBody(event, bodySchema.parse)

    const user = await fetchPxUser(payload.access_token)

    const expiresAt = payload.access_token_expiration_utc
    const maxAge = expiresAt
        ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
        : payload.access_token_lifetime_minutes
            ? payload.access_token_lifetime_minutes * 60
            : undefined

    await replaceUserSession(
        event,
        {
            user,
            loggedInAt: Date.now(),
            expiresAt,
            loginMode: 'password',
            secure: {
                accessToken: payload.access_token,
                refreshToken: payload.refresh_token,
            },
        },
        maxAge ? { maxAge } : undefined,
    )

    return {
        mode: 'password' as const,
        expiresAt,
        // Which keys the widget actually sent — compare against the schema above.
        receivedKeys: Object.keys(payload).sort(),
    }
})
