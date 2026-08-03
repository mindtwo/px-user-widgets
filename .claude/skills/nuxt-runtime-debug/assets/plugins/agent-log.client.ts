/**
 * Dev-only bridge: ships browser console output, uncaught errors and failed
 * requests to .nuxt/agent.log so a coding agent can read them alongside source.
 *
 * Works in any browser (Firefox, Safari, Chrome) because it needs no devtools
 * protocol — the data travels over a normal fetch to a Nitro dev route.
 */
export default defineNuxtPlugin((nuxtApp) => {
    if (!import.meta.dev) return;

    // Set by the Nitro plugin via a meta tag, so client entries can be joined
    // to the SSR request that produced the page.
    const ssrRid =
        document
            .querySelector('meta[name="x-request-id"]')
            ?.getAttribute('content') || undefined;

    const serialize = (v: unknown): unknown => {
        if (v instanceof Error) return { message: v.message, stack: v.stack };
        if (typeof v === 'function')
            return `[Function ${v.name || 'anonymous'}]`;
        try {
            return typeof v === 'string' ? v : JSON.parse(JSON.stringify(v));
        } catch {
            return String(v);
        }
    };

    const nativeFetch = window.fetch.bind(window);

    const send = (entry: Record<string, unknown>) => {
        nativeFetch('/__agent-log', {
            method: 'POST',
            keepalive: true, // survives navigation and unload
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                t: new Date().toISOString(),
                path: location.pathname + location.search,
                ssrRid,
                ...entry,
            }),
        }).catch(() => {
            /* never let logging break the app */
        });
    };

    for (const level of ['log', 'info', 'warn', 'error'] as const) {
        const original = console[level].bind(console);
        console[level] = (...args: unknown[]) => {
            original(...args);
            send({ level, args: args.map(serialize) });
        };
    }

    window.addEventListener('error', (e) => {
        send({
            level: 'uncaught',
            message: e.message,
            source: `${e.filename}:${e.lineno}:${e.colno}`,
            stack: (e.error as Error | undefined)?.stack,
        });
    });

    window.addEventListener('unhandledrejection', (e) => {
        send({ level: 'rejection', ...(serialize(e.reason) as object) });
    });

    nuxtApp.hook('vue:error', (err, _instance, info) => {
        send({ level: 'vue', info, ...(serialize(err) as object) });
    });

    nuxtApp.hook('app:error', (err) => {
        send({ level: 'app', ...(serialize(err) as object) });
    });

    /**
     * Patching the global fetch (not $fetch) covers useFetch, useAsyncData and
     * raw $fetch in one place, since ofetch delegates to window.fetch.
     */
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input instanceof Request ? input.url : input);
        if (url.includes('/__agent-log')) return nativeFetch(input, init);

        const started = performance.now();
        try {
            const res = await nativeFetch(input, init);
            if (!res.ok) {
                send({
                    level: 'http',
                    url,
                    status: res.status,
                    rid: res.headers.get('x-request-id') ?? undefined,
                    ms: Math.round(performance.now() - started),
                });
            }
            return res;
        } catch (err: unknown) {
            send({
                level: 'network',
                url,
                ms: Math.round(performance.now() - started),
                ...(serialize(err) as object),
            });
            throw err;
        }
    };
});
