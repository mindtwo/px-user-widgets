import { createHash, randomBytes } from 'node:crypto'

/**
 * OIDC plumbing for both flows the playground can run.
 *
 * Everything here is server-side on purpose — but not because of a
 * `client_secret`: the token endpoint authenticates the request with PKCE
 * alone, so we are a public client. What stays on the server is the *verifier*,
 * which is the whole point of the service flow. See
 * ../../../docs/oidc-external-app-integration.md.
 */

export interface OidcDiscovery {
    issuer?: string
    authorization_endpoint?: string
    token_endpoint?: string
    userinfo_endpoint?: string
    jwks_uri?: string
    [key: string]: unknown
}

export interface TokenResponse {
    access_token: string
    refresh_token?: string
    id_token?: string
    token_type?: string
    expires_in?: number
    scope?: string
    [key: string]: unknown
}

function pxUserConfig() {
    return useRuntimeConfig().pxUser
}

function requireConfig(value: string | undefined, envVar: string): string {
    if (value) return value

    throw createError({
        statusCode: 500,
        statusMessage: `Missing configuration: set ${envVar} in playground/.env`,
    })
}

/**
 * The redirect_uri, in exactly one place. It has to be byte-identical on the
 * authorize leg and the token leg, and registered exactly on the client — so it
 * must never be assembled twice.
 */
export function pxUserRedirectUri(): string {
    const { appUrl } = useRuntimeConfig().public

    return `${appUrl.replace(/\/$/, '')}/callback`
}

let discoveryCache: Promise<OidcDiscovery> | undefined

/**
 * Resolves the real endpoints from the discovery document instead of guessing
 * them. The token path in particular carries a `{token_format}` segment that
 * varies by tenant configuration, so hardcoding it is explicitly discouraged.
 */
export function discoverOidc(force = false): Promise<OidcDiscovery> {
    if (discoveryCache && !force) return discoveryCache

    const { oidcHost, context } = pxUserConfig()

    const host = requireConfig(oidcHost, 'NUXT_PX_USER_OIDC_HOST').replace(/\/$/, '')
    const ctx = requireConfig(context, 'NUXT_PX_USER_CONTEXT')

    const url = `${host}/${ctx}/oidc/v1.0/.well-known/openid-configuration`

    discoveryCache = $fetch<OidcDiscovery>(url, { headers: { Accept: 'application/json' } }).catch(
        (error) => {
            // Don't cache a failure — a fixed .env should work on the next request.
            discoveryCache = undefined

            throw createError({
                statusCode: 502,
                statusMessage: `OIDC discovery failed for ${url}`,
                data: { url, cause: `${error}` },
            })
        },
    )

    return discoveryCache
}

const base64url = (buffer: Buffer) => buffer.toString('base64url')

export interface AuthorizationRequest {
    url: string
    verifier: string
    state: string
    /** The parameters we sent, so the UI can show them. */
    params: Record<string, string>
}

/**
 * "Auth as a Service": build the authorize URL we send the browser to.
 *
 * The verifier and state stay on the server (see server/api/auth/authorize.get.ts),
 * which is the recommended shape — nothing sensitive touches the browser and the
 * flow survives the callback landing in a different tab.
 */
export function buildAuthorizationUrl(): AuthorizationRequest {
    const { authorizationUrl } = pxUserConfig()
    const { pxUser } = useRuntimeConfig().public

    const base = requireConfig(authorizationUrl, 'NUXT_PX_USER_AUTHORIZATION_URL')
    const clientId = requireConfig(pxUser.clientId, 'NUXT_PUBLIC_PX_USER_CLIENT_ID')

    const verifier = base64url(randomBytes(32))
    const state = base64url(randomBytes(16))

    const params: Record<string, string> = {
        response_type: 'code',
        client_id: clientId,
        redirect_uri: pxUserRedirectUri(),
        scope: pxUser.scope || 'openid',
        state,
        // S256 only — `plain` is not supported.
        code_challenge: base64url(createHash('sha256').update(verifier).digest()),
        code_challenge_method: 'S256',
    }

    // The authorization URL is opaque: it may be a hosted login UI rather than
    // the raw /authorize endpoint, so append rather than reconstruct.
    const url = new URL(base)

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value)
    }

    return { url: url.toString(), verifier, state, params }
}

/**
 * Exchanges the authorization code for tokens. Deliberately without retries:
 * the code has a 5 second TTL, so a backoff would guarantee failure rather than
 * recover from it.
 *
 * No `client_secret`. The endpoint authenticates the request with the PKCE
 * verifier alone — sending one is neither required nor expected, and app-teach
 * (Domain\User\Services\OidcTokenExchangeService) exchanges the same way.
 */
export async function exchangeAuthorizationCode(options: {
    code: string
    codeVerifier: string
}): Promise<TokenResponse> {
    const { pxUser } = useRuntimeConfig().public

    const discovery = await discoverOidc()

    const tokenEndpoint = discovery.token_endpoint

    if (!tokenEndpoint) {
        throw createError({
            statusCode: 502,
            statusMessage: 'OIDC discovery document contains no token_endpoint',
            data: { discovery },
        })
    }

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: options.code,
        code_verifier: options.codeVerifier,
        client_id: requireConfig(pxUser.clientId, 'NUXT_PUBLIC_PX_USER_CLIENT_ID'),
        redirect_uri: pxUserRedirectUri(),
    })

    try {
        return await $fetch<TokenResponse>(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: body.toString(),
        })
    }
    catch (error) {
        const status = (error as { status?: number }).status
        const data = (error as { data?: unknown }).data

        throw createError({
            statusCode: 502,
            statusMessage: 'Token exchange failed',
            // Safe to surface: this is the IdP's own error body, and the request
            // we sent is not echoed back.
            data: { status, response: data, tokenEndpoint },
        })
    }
}
