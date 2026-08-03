/**
 * Vue errors thrown during server-side rendering. These often degrade silently
 * into a client-only render, so they are easy to miss without explicit logging.
 * Output goes to the dev server stdout — capture it with:
 *   npm run dev 2>&1 | tee .nuxt/dev.log
 */
export default defineNuxtPlugin((nuxtApp) => {
    if (!import.meta.dev) return;

    nuxtApp.hook('vue:error', (err: unknown, _instance, info) => {
        console.error('[ssr:vue:error]', info, (err as Error)?.stack ?? err);
    });
});
