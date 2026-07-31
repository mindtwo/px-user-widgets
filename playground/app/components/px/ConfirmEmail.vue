<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-confirm-email> — confirms a new email address from a token.
 *
 * Headless in practice: there is no form, the widget just acts on the token.
 * Built on PxUserTokenWidget, so a missing `data-token` throws as an unhandled
 * rejection — only mount it once you have one.
 */
const props = withDefaults(
    defineProps<{
        token: string
        containerId?: string
        minHeight?: string
    }>(),
    { containerId: 'px-user-confirm-email', minHeight: '140px' },
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
        <px-user-confirm-email ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
