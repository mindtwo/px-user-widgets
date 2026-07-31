<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget';

/**
 * <px-user-oidc> — hosts the PX-User OIDC sign-in form on our own domain and
 * starts an Authorization Code + PKCE flow. See ../../docs/oidc-integration.md.
 *
 * The widget generates its own PKCE verifier/state/challenge into
 * sessionStorage and performs the final redirect from inside its iframe
 * (`window.location.href = …`), which the app cannot intercept. Our callback
 * page reads the verifier back with `readPkce()`.
 *
 * Success event is `login`, not `success`.
 */
const props = withDefaults(
    defineProps<{
        containerId?: string;
        minHeight?: string;
        /** Defaults to the configured client id. */
        clientId?: string;
        /** Defaults to `${appUrl}/callback`. Must be registered exactly. */
        redirectUri?: string;
        scope?: string;
        /** `login` | `none` | `select_account`. Omitted when unset. */
        prompt?: string;
        showEip?: boolean;
        eipRedirectUri?: string;
        /** Keeps a proxied authorize request in the address bar (docs §7). */
        keepAuthorizeParamsInUrl?: boolean;
    }>(),
    { containerId: 'px-user-oidc', minHeight: '360px' },
);

const emit = defineEmits<{
    login: [event: PxUserWidgetEvent];
    error: [event: PxUserWidgetEvent];
    reset: [event: PxUserWidgetEvent];
    mounted: [event: PxUserWidgetEvent];
}>();

const { appUrl, pxUser } = useRuntimeConfig().public;

const el = ref<HTMLElement | null>(null);

const attrs = usePxUserWidgetAttrs(
    () => props.containerId,
    () => ({
        'data-client-id': props.clientId ?? pxUser.clientId,
        'data-redirect-uri': props.redirectUri ?? `${appUrl}/callback`,
        'data-scope': props.scope ?? pxUser.scope,
        'data-prompt': props.prompt,
        'data-show-login-with-eip': props.showEip ?? pxUser.showEipLogin,
        'data-eip-login-redirect-uri': props.eipRedirectUri,
        'data-keep-authorize-params-in-url': props.keepAuthorizeParamsInUrl,
    }),
);

const widgetKey = usePxUserWidgetKey(attrs);

// The generated emit overloads can't take a name chosen at runtime, so widen
// it once here rather than casting at every call.
const forwardEvent = emit as unknown as (
    name: string,
    event: PxUserWidgetEvent,
) => void;

usePxUserWidgetEvents(el, ['login', 'error', 'reset', 'mounted'], forwardEvent);

/** True while the widget is completing another app's authorize request. */
const isProxying = () =>
    Boolean(
        (el.value as unknown as { isProxyingAuthorizeRequest?: boolean })
            ?.isProxyingAuthorizeRequest,
    );

defineExpose({ el, attrs, isProxying });
</script>

<template>
    <PxWidgetHost :min-height="minHeight">
        <px-user-oidc ref="el" :key="widgetKey" v-bind="attrs" />
    </PxWidgetHost>
</template>
