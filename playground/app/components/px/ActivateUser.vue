<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * <px-user-activate-user> — activates an account from an activation token.
 *
 * Built on PxUserTokenWidget, which **throws** when `data-token` is missing.
 * That throw happens inside the `waitForObject(...).then()` chain, which has no
 * `.catch`, so it surfaces as an unhandled promise rejection rather than
 * anything you can catch at the call site — only mount this once you have a
 * token.
 */
const props = withDefaults(
    defineProps<{
        token: string
        containerId?: string
        minHeight?: string
    }>(),
    { containerId: 'px-user-activate-user', minHeight: '340px' },
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
        <px-user-activate-user ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
