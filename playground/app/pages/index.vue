<script setup lang="ts">
import {
    isAuthorizeRequest,
    readPendingAuthorize,
} from '@mindtwo/px-user-widgets/oidc';
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget';

/**
 * The entry point, and where both sides of the OIDC integration meet.
 *
 * The widget is the default path: <px-user-oidc> hosts the form here, mints its
 * own PKCE into sessionStorage and redirects from inside its iframe
 * (docs/oidc-integration.md).
 *
 * The button below it takes the other path: we become the relying party, Nitro
 * mints the PKCE pair and keeps the verifier in the session, and the browser
 * goes to an external hosted login host
 * (docs/oidc-external-app-integration.md).
 *
 * Both come back through /callback.
 */
definePageMeta({ layout: 'auth' });

const { appUrl, pxUser } = useRuntimeConfig().public;
const { keepAuthorizeParamsInUrl, serviceModeAvailable } = useAuthorizeVia();

const { events, log, clear } = useWidgetEventLog();

const redirectUri = `${appUrl.replace(/\/$/, '')}/callback`;

const widget = ref<{
    attrs: Record<string, string>;
    isProxying: () => boolean;
} | null>(null);

/* --- §7 login-as-a-service inspection ------------------------------------- */

const initialSearch = ref('');
const currentSearch = ref('');
const proxying = ref(false);
const pending = ref<ReturnType<typeof readPendingAuthorize>>(null);

function refreshProxyState() {
    currentSearch.value = window.location.search;
    // consume: false — inspecting must not destroy the record.
    pending.value = readPendingAuthorize({ consume: false });
    proxying.value = Boolean(widget.value?.isProxying?.());
}

onMounted(() => {
    // Captured before the widget mounts: it strips authorize params from the URL
    // with history.replaceState, which vue-router never sees.
    initialSearch.value = window.location.search;
    refreshProxyState();
});

const arrivedAsAuthorizeRequest = computed(
    () => Boolean(initialSearch.value) && isAuthorizeRequest(initialSearch.value),
);

const paramsWereStripped = computed(
    () =>
        arrivedAsAuthorizeRequest.value &&
        !isAuthorizeRequest(currentSearch.value),
);

function onWidgetEvent(name: string, event: PxUserWidgetEvent) {
    log(name, event);

    if (name === 'mounted') refreshProxyState();
}
</script>

<template>
    <div class="stack">
        <div>
            <h1>Sign in</h1>
            <p class="lede">
                <code>&lt;px-user-oidc&gt;</code> hosts the form here and generates
                its own PKCE into <code>sessionStorage</code>. The code is
                exchanged for tokens on the server, via
                <code>/callback</code>.
            </p>
        </div>

        <!-- The widget ---------------------------------------------------- -->
        <div class="card">
            <PxOidcLogin
                ref="widget"
                container-id="playground-oidc"
                :redirect-uri="redirectUri"
                :keep-authorize-params-in-url="keepAuthorizeParamsInUrl"
                @login="onWidgetEvent('login', $event)"
                @error="onWidgetEvent('error', $event)"
                @reset="onWidgetEvent('reset', $event)"
                @mounted="onWidgetEvent('mounted', $event)"
            />

            <!-- The other flow, below the widget -------------------------- -->
            <div class="alt">
                <p class="alt__rule"><span>or</span></p>

                <a
                    v-if="serviceModeAvailable"
                    class="btn btn--ghost alt__btn"
                    href="/api/auth/authorize"
                >
                    Use Auth as a Service to authenticate
                </a>

                <button
                    v-else
                    type="button"
                    class="btn btn--ghost alt__btn"
                    disabled
                    title="Set NUXT_PX_USER_AUTHORIZATION_URL in playground/.env"
                >
                    Use Auth as a Service to authenticate
                </button>

                <p v-if="!serviceModeAvailable" class="notice">
                    <strong>Not configured.</strong> Set
                    <code>NUXT_PX_USER_AUTHORIZATION_URL</code> in
                    <code>playground/.env</code> to the hosted login host you
                    were given, then restart the dev server.
                </p>

                <details class="alt__details">
                    <summary class="muted">
                        What this sends instead of rendering the widget
                    </summary>

                    <p class="muted">
                        No widget is involved. The link is a normal navigation to
                        <code>/api/auth/authorize</code>, which 302s onward. The
                        <code>state</code> and <code>code_challenge</code> are
                        minted per request on the server and are deliberately not
                        shown — the verifier never reaches the browser.
                    </p>

                    <table class="table">
                        <thead>
                            <tr><th>Parameter</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>response_type</code></td>
                                <td><code>code</code></td>
                            </tr>
                            <tr>
                                <td><code>client_id</code></td>
                                <td>
                                    <code v-if="pxUser.clientId">{{ pxUser.clientId }}</code>
                                    <span v-else class="warn">
                                        NUXT_PUBLIC_PX_USER_CLIENT_ID is empty
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td><code>redirect_uri</code></td>
                                <td><code>{{ redirectUri }}</code></td>
                            </tr>
                            <tr>
                                <td><code>scope</code></td>
                                <td><code>{{ pxUser.scope }}</code></td>
                            </tr>
                            <tr>
                                <td><code>code_challenge_method</code></td>
                                <td><code>S256</code></td>
                            </tr>
                            <tr>
                                <td>
                                    <code>state</code> /
                                    <code>code_challenge</code>
                                </td>
                                <td class="muted">generated server-side</td>
                            </tr>
                        </tbody>
                    </table>
                </details>
            </div>

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />

        <!-- §7 proxy inspection ----------------------------------------- -->
        <div class="card">
            <h2>Authorize-Via status</h2>

            <p class="muted">
                What the widget did with an incoming authorize request from
                another app. Build one on
                <NuxtLink to="/authorize-via">Authorize-Via</NuxtLink>.
            </p>

            <table class="table">
                <tbody>
                    <tr>
                        <td>Arrived as an authorize request</td>
                        <td>
                            <span :class="arrivedAsAuthorizeRequest ? 'ok' : 'muted'">
                                {{ arrivedAsAuthorizeRequest ? 'yes' : 'no' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Params stripped from the URL</td>
                        <td>
                            <span v-if="!arrivedAsAuthorizeRequest" class="muted">n/a</span>
                            <span v-else :class="paramsWereStripped ? 'ok' : 'warn'">
                                {{ paramsWereStripped ? 'yes' : 'still present' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td><code>hasPendingAuthorize()</code></td>
                        <td>
                            <span :class="pending ? 'ok' : 'muted'">
                                {{ pending ? 'true' : 'false' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td><code>el.isProxyingAuthorizeRequest</code></td>
                        <td>
                            <span :class="proxying ? 'ok' : 'muted'">{{ proxying }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td><code>data-keep-authorize-params-in-url</code></td>
                        <td><code>{{ keepAuthorizeParamsInUrl }}</code></td>
                    </tr>
                </tbody>
            </table>

            <pre v-if="pending" class="code-block" style="margin-top: 0.75rem">{{ JSON.stringify(pending, null, 2) }}</pre>

            <p style="margin-top: 1rem">
                <button type="button" class="btn btn--ghost" @click="refreshProxyState">
                    Refresh
                </button>
            </p>
        </div>

        <p class="muted">
            Prefer the classic username/password form?
            <NuxtLink to="/login">Use the login widget</NuxtLink>. Every other
            widget lives under <NuxtLink to="/widgets">Widgets</NuxtLink>.
        </p>
    </div>
</template>

<style scoped>
.alt {
    margin-top: 1.25rem;
}

.alt__rule {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 1rem;
    color: var(--muted);
    font-size: 0.8125rem;
}

.alt__rule::before,
.alt__rule::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}

.alt__btn {
    width: 100%;
}

.alt__details {
    margin-top: 1rem;
}

.alt__details summary {
    cursor: pointer;
    font-size: 0.875rem;
}
</style>
