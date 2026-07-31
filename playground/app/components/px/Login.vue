<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-login> — classic username/password form. Emits the token pair
 * directly on its `login` event (no OIDC round trip), which the app hands to
 * its own server to establish a session.
 *
 * Success event is `login`, and this widget shows no success message of its own
 * (`static showSuccessMessage = false`).
 *
 * Caveat worth knowing: the widget reads `showLoginWithEip` with the raw
 * `config()` rather than `configBool()`, so the string "false" would be truthy.
 * Our attribute helper drops false values entirely, which is what keeps this
 * correct.
 */
const props = withDefaults(
    defineProps<{
        containerId?: string
        minHeight?: string
        clientId?: string
        scope?: string
        prompt?: string
        showEip?: boolean
    }>(),
    { containerId: 'px-user-login', minHeight: '340px' },
)

const emit = defineEmits<{
    login: [event: PxUserWidgetEvent]
    error: [event: PxUserWidgetEvent]
    reset: [event: PxUserWidgetEvent]
    mounted: [event: PxUserWidgetEvent]
}>()

const { pxUser } = useRuntimeConfig().public

const el = ref<HTMLElement | null>(null)

const attrs = usePxUserWidgetAttrs(
    () => props.containerId,
    () => ({
        'data-client-id': props.clientId ?? pxUser.clientId,
        'data-scope': props.scope ?? pxUser.scope,
        'data-prompt': props.prompt,
        'data-show-login-with-eip': props.showEip ?? pxUser.showEipLogin,
    }),
)

const widgetKey = usePxUserWidgetKey(attrs)

// The generated emit overloads can't take a name chosen at runtime, so widen
// it once here rather than casting at every call.
const forwardEvent = emit as unknown as (name: string, event: PxUserWidgetEvent) => void

usePxUserWidgetEvents(el, ['login', 'error', 'reset', 'mounted'], forwardEvent)

defineExpose({ el, attrs })
</script>

<template>
    <PxWidgetHost :min-height="minHeight">
        <px-user-login ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
