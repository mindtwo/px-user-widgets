import type { PxUserProfile } from '../../shared/types/px-user'

/**
 * Thin client for the px-user API (https://user.api.pl-x.cloud/docs/).
 *
 * All calls are Bearer-authenticated with the session's access token. The
 * `x-context-*` headers carry the tenant/domain context that several endpoints
 * require.
 */

function apiBase(): string {
    const { apiHost } = useRuntimeConfig().pxUser

    return apiHost.replace(/\/$/, '')
}

function contextHeaders(accessToken: string): Record<string, string> {
    const { pxUser } = useRuntimeConfig().public

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
    }

    if (pxUser.tenant) headers['x-context-tenant-code'] = pxUser.tenant
    if (pxUser.domain) headers['x-context-domain-code'] = pxUser.domain

    return headers
}

/**
 * Unwraps the common `{ data: … }` envelope. The playground should show whatever
 * the API returns rather than assume a shape, so this stays deliberately loose.
 */
function unwrap<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: T }).data
    }

    return response as T
}

/** `GET /v1/user` — current user details. */
export async function fetchPxUser(accessToken: string): Promise<PxUserProfile> {
    const response = await $fetch(`${apiBase()}/v1/user`, {
        headers: contextHeaders(accessToken),
    })

    return unwrap<PxUserProfile>(response)
}

/** `GET /v1/user-with-permissions` — the same, plus roles and permissions. */
export async function fetchPxUserWithPermissions(accessToken: string): Promise<PxUserProfile> {
    const response = await $fetch(`${apiBase()}/v1/user-with-permissions`, {
        headers: contextHeaders(accessToken),
    })

    return unwrap<PxUserProfile>(response)
}

/** `GET /v1/logout`. Best-effort — a failure here must not block clearing the session. */
export async function pxUserLogout(accessToken: string): Promise<void> {
    await $fetch(`${apiBase()}/v1/logout`, {
        headers: contextHeaders(accessToken),
    })
}
