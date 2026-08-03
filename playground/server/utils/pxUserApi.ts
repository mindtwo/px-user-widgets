import type { PxUserProfile } from '../../shared/types/px-user';

/**
 * Thin client for the px-user API (https://user.api.pl-x.cloud/docs/).
 *
 * All calls are Bearer-authenticated with the session's access token. The
 * `x-context-*` headers carry the tenant/domain context that several endpoints
 * require.
 */

function apiBase(): string {
    const { apiHost } = useRuntimeConfig().pxUser;

    return apiHost.replace(/\/$/, '');
}

function contextHeaders(accessToken: string): Record<string, string> {
    const { pxUser } = useRuntimeConfig().public;

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
    };

    if (pxUser.tenant) headers['x-context-tenant-code'] = pxUser.tenant;
    if (pxUser.domain) headers['x-context-domain-code'] = pxUser.domain;

    return headers;
}

/** The inner object of `key`, or undefined when it isn't one. */
function nested(
    value: unknown,
    key: string,
): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object') return undefined;

    const inner = (value as Record<string, unknown>)[key];

    return inner && typeof inner === 'object'
        ? (inner as Record<string, unknown>)
        : undefined;
}

/**
 * px-user wraps every payload in `response`, and the profile endpoints nest the
 * user one level further under `user`. Peel both — but only where they actually
 * are, so a shape change surfaces as visibly wrong data rather than as an empty
 * object.
 *
 * This has to happen here rather than at the call sites: `fetchPxUser()` also
 * feeds `session.user` in server/api/auth/oidc-callback.post.ts, so an envelope
 * that escapes gets sealed into the session cookie.
 */
function unwrapProfile(payload: unknown): PxUserProfile {
    const body = nested(payload, 'response') ?? payload;

    return (nested(body, 'user') ?? body) as PxUserProfile;
}

/** `GET /v1/user` — current user details. */
export async function fetchPxUser(accessToken: string): Promise<PxUserProfile> {
    const response = await $fetch(`${apiBase()}/v1/user`, {
        headers: contextHeaders(accessToken),
    });

    return unwrapProfile(response);
}

/** `GET /v1/user-with-permissions` — the same, plus roles and permissions. */
export async function fetchPxUserWithPermissions(
    accessToken: string,
): Promise<PxUserProfile> {
    const response = await $fetch(`${apiBase()}/v1/user-with-permissions`, {
        headers: contextHeaders(accessToken),
    });

    return unwrapProfile(response);
}

/** `GET /v1/logout`. Best-effort — a failure here must not block clearing the session. */
export async function pxUserLogout(accessToken: string): Promise<void> {
    await $fetch(`${apiBase()}/v1/logout`, {
        headers: contextHeaders(accessToken),
    });
}
