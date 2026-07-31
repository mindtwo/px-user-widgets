import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * Turns a widget's `login` event into a server session.
 *
 * Three widgets emit the same token pair this way — <px-user-login>,
 * <px-user-activate-user-and-login> and
 * <px-user-set-password-by-forgot-password-code-and-login> — so the handling
 * lives here rather than in each page.
 */
export function useWidgetLogin(redirectTo = '/dashboard') {
    const session = useUserSession()

    const busy = ref(false)
    const failure = ref<string | null>(null)

    async function signIn(event: PxUserWidgetEvent) {
        // The payload is spread onto the event object; `event.detail` is always
        // undefined. Widgets put the token pair under `response`, but fall back to
        // the event's own properties so a shape change is still visible.
        const payload = (event.response ?? pxUserEventPayload(event)) as Record<string, unknown>

        if (!payload?.access_token) {
            failure.value
                = 'The login event carried no access_token. Expand the entry in the event log to see what it did carry.'

            return
        }

        busy.value = true
        failure.value = null

        try {
            await $fetch('/api/auth/widget-login', { method: 'POST', body: payload })
            await session.fetch()
            await navigateTo(redirectTo)
        }
        catch (error) {
            const e = error as { statusMessage?: string, data?: { statusMessage?: string } }

            failure.value
                = e.data?.statusMessage ?? e.statusMessage ?? 'Could not establish the session.'
        }
        finally {
            busy.value = false
        }
    }

    return { busy, failure, signIn }
}
