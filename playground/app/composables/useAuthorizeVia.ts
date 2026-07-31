const KEEP_PARAMS_KEY = 'px-playground.keep-authorize-params';

/**
 * The one widget flag that has to be shared between `/` (which binds it) and
 * `/authorize-via` (which toggles it).
 *
 * Persisted in localStorage rather than the URL: putting it in the query string
 * would collide with the authorize parameters the widget looks for.
 */
export function useAuthorizeVia() {
    const { serviceModeAvailable } = useRuntimeConfig().public;

    const keepAuthorizeParamsInUrl = useState<boolean>(
        'px-keep-authorize-params',
        () => false,
    );

    // Read once on the client. SSR renders the default, which avoids a hydration
    // mismatch on a value the server cannot know.
    onMounted(() => {
        keepAuthorizeParamsInUrl.value =
            localStorage.getItem(KEEP_PARAMS_KEY) === 'true';
    });

    watch(keepAuthorizeParamsInUrl, (value) => {
        if (import.meta.client)
            localStorage.setItem(KEEP_PARAMS_KEY, String(value));
    });

    return { keepAuthorizeParamsInUrl, serviceModeAvailable };
}
