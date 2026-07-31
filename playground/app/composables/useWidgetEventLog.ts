import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

export interface LoggedWidgetEvent {
    id: number
    name: string
    at: string
    payload: Record<string, unknown>
    /** Proves the point: the widget's payload is never in `event.detail`. */
    hasDetail: boolean
}

/**
 * Collects widget events for <PxWidgetEventLog>. `log` has exactly the
 * signature `usePxUserWidgetEvents` expects, so a page can wire the two
 * together in one line.
 */
export function useWidgetEventLog() {
    const events = ref<LoggedWidgetEvent[]>([])
    let nextId = 0

    const log = (name: string, event: PxUserWidgetEvent) => {
        events.value = [
            {
                id: nextId++,
                name,
                at: new Date().toISOString().slice(11, 23),
                payload: pxUserEventPayload(event),
                hasDetail: 'detail' in event && (event as unknown as CustomEvent).detail !== undefined,
            },
            ...events.value,
        ]
    }

    const clear = () => {
        events.value = []
    }

    return { events, log, clear }
}
