/**
 * Shape of the px-user API's user object (`GET /v1/user`).
 *
 * Everything is optional and the index signature is intentional: the playground
 * should surface whatever the API actually returns — including fields this file
 * doesn't know about — rather than fail validation on drift.
 */
export interface PxUserProfile {
    id?: string
    email?: string
    preferred_username?: string
    firstname?: string
    lastname?: string
    gender?: string
    tenant_code?: string
    domain_code?: string
    locale?: string
    source?: string
    is_enabled?: boolean
    is_confirmed?: boolean
    activated_at?: string
    last_login_at?: string
    capabilities?: unknown
    products?: unknown
    [key: string]: unknown
}

/** Which flow established the session. Shown on the dashboard. */
export type PxLoginMode = 'service' | 'widget' | 'password'
