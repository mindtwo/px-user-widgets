import { isOidcHandshakeInFlight } from '@mindtwo/px-user-widgets/oidc'

/**
 * Order matters here.
 *
 * The handshake check comes first because the OIDC widget performs its final
 * redirect from inside its iframe and strips its own query parameters with
 * history.replaceState — the app cannot intercept either. If a route guard
 * redirects while that is happening, the login dies silently. See
 * ../../../docs/oidc-integration.md §7.
 *
 * `/widgets/**` and `/authorize-via` stay open: they are test surfaces, not
 * product routes.
 */
export default defineNuxtRouteMiddleware((to) => {
    // Pass the search string explicitly. The helper's implicit fallback is
    // globalThis.location, which is empty during SSR — it reads the URL only, so
    // with an argument it is safe on both sides.
    const search = new URL(to.fullPath, 'http://localhost').search

    if (isOidcHandshakeInFlight(search)) return

    if (to.path === '/callback') return

    const { loggedIn } = useUserSession()

    if (to.path === '/dashboard' && !loggedIn.value) {
        return navigateTo('/')
    }

    if ((to.path === '/' || to.path === '/login') && loggedIn.value) {
        return navigateTo('/dashboard')
    }
})
