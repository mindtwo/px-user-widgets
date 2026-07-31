import type { Ref } from 'vue'

/**
 * The package builds its events as `class PxUserEvent extends Event` and then
 * `Object.assign(this, payload)` — so the payload sits on the event *object*,
 * not in `event.detail`. `event.detail` is always undefined.
 */
export type PxUserWidgetEvent = Event & Record<string, unknown>

/** Every widget's own attributes, in the exact casing the widget parses. */
export interface PxUserWidgetAttrs {
    // `stage` / `tenant` / `domain` are the only three the widget accepts
    // undashed (configKeys in px-user-base-widget.js).
    stage: string
    tenant: string
    domain: string
    'data-app-url': string
    'data-css-path': string
    'data-language': string
    // NOTE kebab-case. `data-containerId` looks right but the DOM lowercases
    // attribute names and camelCase('containerid') === 'containerid', so the
    // widget never finds the config key and silently falls back to its default.
    'data-container-id': string
    [key: string]: string | undefined
}

/**
 * Builds the attribute bag for a widget: the shared environment attributes plus
 * whatever the specific widget adds. Undefined values are dropped so that an
 * absent flag really is an absent attribute — the widget's `configBool` reads
 * strings, and `px-user-login.js` doesn't even use it, so the literal string
 * "false" would switch a feature *on*.
 */
export function usePxUserWidgetAttrs(
    containerId: MaybeRefOrGetter<string>,
    extra?: MaybeRefOrGetter<Record<string, string | boolean | undefined>>,
) {
    const { appUrl, pxUser } = useRuntimeConfig().public

    return computed<PxUserWidgetAttrs>(() => {
        const attrs: PxUserWidgetAttrs = {
            'stage': pxUser.stage,
            'tenant': pxUser.tenant,
            'domain': pxUser.domain,
            'data-app-url': appUrl,
            'data-css-path': pxUser.cssPath,
            'data-language': pxUser.language,
            'data-container-id': toValue(containerId),
        }

        for (const [key, value] of Object.entries(toValue(extra) ?? {})) {
            if (value === undefined || value === null || value === false || value === '') continue

            attrs[key] = value === true ? 'true' : String(value)
        }

        return attrs
    })
}

/**
 * The widget reads its attributes exactly once, in connectedCallback, and
 * `loadConfig()` self-guards against running twice. There is no
 * observedAttributes and no attributeChangedCallback, so changing a bound
 * attribute after mount does nothing at all. Keying the element on its own
 * attributes is the only way to make a wrapper look reactive.
 */
export function usePxUserWidgetKey(attrs: Ref<PxUserWidgetAttrs>) {
    return computed(() => JSON.stringify(attrs.value))
}

/**
 * Attaches listeners with addEventListener rather than Vue's `@success` /
 * `@error` template handlers. The widget's events are `bubbles: true,
 * composed: true` and its default names (`success`, `error`, `reset`,
 * `mounted`) collide with native DOM events — `@error` on the element would
 * also catch resource errors bubbling out of the widget's own iframe.
 *
 * Watching the ref rather than using onMounted matters twice over: the element
 * lives inside <ClientOnly> so it isn't in the DOM yet when the parent mounts,
 * and it is replaced wholesale whenever the key changes.
 */
export function usePxUserWidgetEvents(
    el: Ref<HTMLElement | null>,
    names: readonly string[],
    onEvent: (name: string, event: PxUserWidgetEvent) => void,
) {
    let attached: HTMLElement | null = null
    let listeners: Array<[string, EventListener]> = []

    const detach = () => {
        if (attached) {
            for (const [name, listener] of listeners) {
                attached.removeEventListener(name, listener)
            }
        }

        listeners = []
        attached = null
    }

    const attach = (target: HTMLElement | null) => {
        detach()

        if (!target) return

        attached = target

        for (const name of names) {
            const listener = (event: Event) => onEvent(name, event as PxUserWidgetEvent)

            target.addEventListener(name, listener)
            listeners.push([name, listener])
        }
    }

    // flush: 'post' so the element is in the DOM by the time we see the ref.
    watch(el, attach, { immediate: true, flush: 'post' })
    onBeforeUnmount(detach)
}

/**
 * The event's own enumerable properties — i.e. exactly what the widget spread
 * onto it. Used by the event log so you can see the real payload shape.
 */
export function pxUserEventPayload(event: PxUserWidgetEvent): Record<string, unknown> {
    const payload: Record<string, unknown> = {}

    for (const key of Object.keys(event)) {
        payload[key] = event[key]
    }

    return payload
}
