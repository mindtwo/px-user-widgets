<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-activate-user-and-login> — activates the account and logs the user in
 * in one step.
 *
 * Unlike <px-user-activate-user> this one reads `data-token` with plain
 * `config('token')` and does not throw when it is absent.
 *
 * Success event is `login`, carrying the token pair.
 */
const props = withDefaults(
    defineProps<{
        token: string
        containerId?: string
        minHeight?: string
    }>(),
    { containerId: 'px-user-activate-user-and-login', minHeight: '380px' },
)

const emit = defineEmits<{
    login: [event: PxUserWidgetEvent]
    error: [event: PxUserWidgetEvent]
    reset: [event: PxUserWidgetEvent]
    mounted: [event: PxUserWidgetEvent]
}>()

const el = ref<HTMLElement | null>(null)

const attrs = usePxUserWidgetAttrs(
    () => props.containerId,
    () => ({ 'data-token': props.token }),
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
        <px-user-activate-user-and-login ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
