/**
 * Sink for browser-side log entries. Dev only — returns 404 in production so
 * the route cannot be probed if the plugin is ever bundled by accident.
 */
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const LOG = '.nuxt/agent.log';

export default defineEventHandler(async (event) => {
    if (!import.meta.dev) throw createError({ statusCode: 404 });

    const body = await readBody(event);
    try {
        await mkdir(dirname(LOG), { recursive: true });
        await appendFile(
            LOG,
            JSON.stringify({ side: 'client', ...body }) + '\n',
        );
    } catch {
        /* ignore */
    }
    return { ok: true };
});
