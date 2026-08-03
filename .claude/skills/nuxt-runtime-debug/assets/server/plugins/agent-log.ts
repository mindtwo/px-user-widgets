/**
 * Dev-only server instrumentation. Writes request timings, Nitro errors and
 * process-level crashes to .nuxt/agent.log, and stamps a short request id into
 * both the response headers and the rendered HTML so client-side entries can be
 * correlated with the SSR request that produced them.
 */
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const LOG = '.nuxt/agent.log';

// Asset and tooling traffic would drown out anything useful.
const IGNORE = [
    '/__agent-log',
    '/_nuxt/',
    '/__nuxt',
    '/@vite/',
    '/@fs/',
    '/@id/',
    '/favicon.ico',
];

// Allowlist, not denylist: a new auth header must never leak in by default.
const SAFE_HEADERS = [
    'content-type',
    'accept',
    'accept-language',
    'x-request-id',
];

export default defineNitroPlugin((nitro) => {
    if (!import.meta.dev) return;

    let ready: Promise<unknown> | null = null;
    const write = async (entry: Record<string, unknown>) => {
        try {
            ready ??= mkdir(dirname(LOG), { recursive: true });
            await ready;
            await appendFile(
                LOG,
                JSON.stringify({
                    side: 'server',
                    t: new Date().toISOString(),
                    ...entry,
                }) + '\n',
            );
        } catch {
            /* logging must never take the dev server down */
        }
    };

    nitro.hooks.hook('request', (event) => {
        if (IGNORE.some((p) => event.path.startsWith(p))) return;
        const rid = randomUUID().slice(0, 8);
        event.context.rid = rid;
        event.context.startedAt = performance.now();
        setResponseHeader(event, 'x-request-id', rid);
    });

    nitro.hooks.hook('afterResponse', (event) => {
        if (!event.context.rid) return;
        const headers = getRequestHeaders(event);
        write({
            kind: 'request',
            rid: event.context.rid,
            method: event.method,
            path: event.path,
            status: getResponseStatus(event),
            ms: Math.round(
                performance.now() - (event.context.startedAt as number),
            ),
            headers: Object.fromEntries(
                Object.entries(headers).filter(([k]) =>
                    SAFE_HEADERS.includes(k.toLowerCase()),
                ),
            ),
        });
    });

    nitro.hooks.hook('error', (error: any, { event }) => {
        write({
            kind: 'error',
            rid: event?.context?.rid,
            path: event?.path,
            statusCode: error?.statusCode,
            message: error?.message,
            data: error?.data,
            cause: error?.cause ? String(error.cause) : undefined,
            stack: error?.stack,
        });
    });

    nitro.hooks.hook('render:html', (html, { event }) => {
        html.head.push(
            `<meta name="x-request-id" content="${event.context.rid ?? ''}">`,
        );
    });

    process.on('unhandledRejection', (reason: any) => {
        write({
            kind: 'unhandledRejection',
            message: String(reason),
            stack: reason?.stack,
        });
    });

    process.on('uncaughtException', (err) => {
        write({
            kind: 'uncaughtException',
            message: err.message,
            stack: err.stack,
        });
    });
});
