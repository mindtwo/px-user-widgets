// Session shape for nuxt-auth-utils.
//
// Access/refresh tokens and the service-mode PKCE live in `secure`, which is
// only ever readable server-side — the browser never sees them.
//
// This lives in shared/types/ rather than at the project root on purpose:
// .nuxt/tsconfig.app.json includes `../*.d.ts` but tsconfig.server.json does
// not, so a root-level auth.d.ts augments the session type for the app and
// silently leaves the Nitro routes typed against the unaugmented interface.
// Both projects include `../shared/**/*.d.ts`.

import type { PxLoginMode, PxUserProfile } from './px-user'

declare module '#auth-utils' {
    interface User extends PxUserProfile {}

    interface UserSession {
        loggedInAt?: number
        expiresAt?: string
        /** Which flow established this session. */
        loginMode?: PxLoginMode
    }

    interface SecureSessionData {
        accessToken?: string
        refreshToken?: string
        /** "Auth as a Service" PKCE. Single use — deleted on first callback. */
        pendingOidc?: {
            verifier: string
            state: string
            createdAt: number
        }
    }
}

export {}
