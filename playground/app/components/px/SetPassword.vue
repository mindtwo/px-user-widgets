<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-set-password> — sets a new password for a reset token.
 *
 * Takes `data-token` and emits the default `success` event. Enables
 * `showPasswordRules` and the two-field password toggle icons internally.
 */
const props = withDefaults(
    defineProps<{
        token: string
        containerId?: string
        minHeight?: string
    }>(),
    { containerId: 'px-user-set-password', minHeight: '340px' },
)

const emit = defineEmits<{
    success: [event: PxUserWidgetEvent]
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

usePxUserWidgetEvents(el, ['success', 'error', 'reset', 'mounted'], forwardEvent)

defineExpose({ el, attrs })
</script>

<template>
    <PxWidgetHost :min-height="minHeight">
        <px-user-set-password ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
