/**
 * Registers the <px-user-*> custom elements. Client-only by necessity:
 * src/base/px-user-base-widget.js does `class … extends HTMLElement` at module
 * eval, which throws a ReferenceError in Node.
 *
 * Three ordering constraints are handled here, all of them load-bearing:
 *
 *  1. `window.PX_WIDGETS_VERBOSITY` is read at module-eval time by the
 *     @WithLogger decorator, so it must be assigned *before* the package is
 *     evaluated. A static `import` would be hoisted above the assignment —
 *     hence the dynamic `await import()`.
 *  2. The host script (widget.js) is not part of the npm package and is
 *     mandatory. Every widget's connectedCallback waits on `window.PxModUser`.
 *  3. That wait (`waitForObject`) polls every 100 ms and never times out or
 *     rejects. Without the check below, a missing host script looks like a
 *     widget that renders nothing, with no error anywhere.
 */
export default defineNuxtPlugin(async () => {
    const { pxUser } = useRuntimeConfig().public;

    if (import.meta.dev) {
        (window as unknown as Record<string, string>).PX_WIDGETS_VERBOSITY =
            'debug';
    }

    const host =
        pxUser.stage === 'prod' || pxUser.stage === 'production'
            ? 'https://user-frontend.api.pl-x.cloud'
            : 'https://user-frontend.api.preprod.pl-x.cloud';

    try {
        await loadScriptOnce(`${host}/js/widget.js`);
    } catch (error) {
        console.error('[px-user] failed to load the widget host script', error);
    }

    // Registration is idempotent and side-effect only — the package exports nothing.
    await import('@mindtwo/px-user-widgets');

    if (import.meta.dev) {
        warnIfHostScriptMissing();
    }
});

const pending = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
    const existing = pending.get(src);
    if (existing) return existing;

    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        // The host script is not a module and must keep document order semantics.
        script.async = false;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener(
            'error',
            () => reject(new Error(`Could not load ${src}`)),
            { once: true },
        );

        document.head.appendChild(script);
    });

    pending.set(src, promise);

    return promise;
}

function warnIfHostScriptMissing(timeoutMs = 10_000) {
    if ('PxModUser' in window) return;

    const timer = window.setTimeout(() => {
        if ('PxModUser' in window) return;

        console.warn(
            '[px-user] window.PxModUser is still undefined after ' +
                `${timeoutMs / 1000}s. Every widget on this page is stuck in ` +
                'waitForObject(), which polls forever and never rejects. Check that ' +
                'the host script loaded and is not blocked by an extension or CSP.',
        );
    }, timeoutMs);

    // Stop nagging as soon as it does show up.
    const poll = window.setInterval(() => {
        if (!('PxModUser' in window)) return;

        window.clearTimeout(timer);
        window.clearInterval(poll);
    }, 200);
}
