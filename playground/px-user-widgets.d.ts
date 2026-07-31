// `@mindtwo/px-user-widgets` ships no .d.ts (package.json has `files: ["dist"]`
// and no `types` field), so declare what the playground actually uses.
//
// Keep this in sync with src/oidc.js — it is the package's only typed surface.

declare module '@mindtwo/px-user-widgets'

declare module '@mindtwo/px-user-widgets/oidc' {
    export interface Pkce {
        verifier: string
        state: string
        challenge: string
    }

    export interface PkceStorageKeys {
        verifierKey?: string
        stateKey?: string
        challengeKey?: string
    }

    export interface PendingAuthorize {
        params: Record<string, string>
        extra: Record<string, string>
    }

    export interface RecordReadOptions {
        key?: string
        ttl?: number
        consume?: boolean
    }

    export const DEFAULT_VERIFIER_KEY: string
    export const DEFAULT_STATE_KEY: string
    export const DEFAULT_CHALLENGE_KEY: string
    export const DEFAULT_PENDING_REQUEST_KEY: string
    export const DEFAULT_PENDING_REQUEST_TTL: number
    export const DEFAULT_IMPERSONATION_KEY: string
    export const DEFAULT_IMPERSONATION_TTL: number

    // PKCE
    export function generatePkce(): Promise<Pkce>
    export function storePkce(pkce: Partial<Pkce>, keys?: PkceStorageKeys): void
    export function readPkce(
        options?: PkceStorageKeys & { consume?: boolean },
    ): { verifier: string | null; state: string | null; challenge: string | null }
    export function clearPkce(keys?: PkceStorageKeys): void
    export function challengeFromVerifier(verifier: string): Promise<string>
    export function base64UrlEncode(bytes: Uint8Array): string

    // Flow predicates — URL-only, safe to call during SSR.
    export function isOidcHandshakeInFlight(search?: string | URLSearchParams): boolean
    export function isAuthorizeRequest(search?: string | URLSearchParams): boolean
    export function isOidcReturn(search?: string | URLSearchParams): boolean

    // Proxied authorize request (login-as-a-service)
    export function storePendingAuthorize(request: PendingAuthorize, options?: RecordReadOptions): void
    export function readPendingAuthorize(options?: RecordReadOptions): PendingAuthorize | null
    export function hasPendingAuthorize(options?: RecordReadOptions): boolean
    export function clearPendingAuthorize(options?: RecordReadOptions): void
    export function readAuthorizeRequestFromUrl(search?: string): PendingAuthorize
    export function authorizeRequestParamNames(): string[]
    export function stripUrlParams(names: string[]): boolean

    // Impersonation
    export function storeImpersonationKey(value: string, options?: RecordReadOptions): void
    export function readImpersonationKey(options?: RecordReadOptions): string | null
    export function clearImpersonationKey(options?: RecordReadOptions): void
}
