<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-activate-user-with-activation-code> — activation by code.
 *
 * Two things are unique to this widget:
 *  - its success event is named **`activated`**, not `success`;
 *  - it installs `onSuccessActivationCode` / `onErrorActivationCode` callbacks
 *    that write straight into the message spans and emit **nothing**. So the
 *    code-validation step is invisible to the host page; only the final
 *    activation shows up as `activated`.
 *
 * It is also the only sibling that does not set `config.icons`.
 */
const props = withDefaults(
    defineProps<{
        token?: string
        containerId?: string
        minHeight?: string
    }>(),
    { containerId: 'px-user-activation-code', minHeight: '380px' },
)

const emit = defineEmits<{
    activated: [event: PxUserWidgetEvent]
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

usePxUserWidgetEvents(el, ['activated', 'error', 'reset', 'mounted'], forwardEvent)

defineExpose({ el, attrs })
</script>

<template>
    <PxWidgetHost :min-height="minHeight">
        <px-user-activate-user-with-activation-code ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
