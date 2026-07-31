<script setup lang="ts">
import {
    authorizeRequestParamNames,
    clearImpersonationKey,
    clearPendingAuthorize,
    generatePkce,
    isAuthorizeRequest,
    readImpersonationKey,
    readPendingAuthorize,
} from '@mindtwo/px-user-widgets/oidc'

/**
 * Login-as-a-service: the index page can complete an authorize request that
 * belongs to *another* app. See docs/oidc-integration.md §7.
 *
 * That path is not reachable from either mode on `/` — it is triggered by
 * arriving at `/` with a full authorize query — so this page builds such a URL
 * and inspects what the widget did with it.
 *
 * Note we generate the PKCE pair here in the browser on purpose: in this flow
 * the verifier belongs to the *external* app, not to us, and neither the `code`
 * nor the `state` is ours to validate.
 */
definePageMeta({ layout: 'default' })

const { appUrl } = useRuntimeConfig().public
const { keepAuthorizeParamsInUrl } = useAuthorizeVia()

const origin = appUrl.replace(/\/$/, '')

const form = reactive({
    clientId: 'external-demo-client',
    redirectUri: `${origin}/callback`,
    scope: 'openid profile email',
    prompt: '',
    state: '',
    codeChallenge: '',
})

const generating = ref(false)

async function regeneratePkce() {
    generating.value = true

    try {
        const pkce = await generatePkce()

        form.state = pkce.state
        form.codeChallenge = pkce.challenge
    }
    finally {
        generating.value = false
    }
}

const authorizeUrl = computed(() => {
    const url = new URL(`${origin}/`)

    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', form.clientId)
    url.searchParams.set('redirect_uri', form.redirectUri)
    url.searchParams.set('scope', form.scope)
    if (form.state) url.searchParams.set('state', form.state)
    if (form.codeChallenge) {
        url.searchParams.set('code_challenge', form.codeChallenge)
        url.searchParams.set('code_challenge_method', 'S256')
    }
    if (form.prompt) url.searchParams.set('prompt', form.prompt)

    return url.toString()
})

/** Mirrors the widget's own test, so the two can never disagree. */
const looksLikeAuthorizeRequest = computed(() =>
    isAuthorizeRequest(new URL(authorizeUrl.value).search),
)

/* --- inspector ------------------------------------------------------------ */

const pending = ref<ReturnType<typeof readPendingAuthorize>>(null)
const rawPending = ref<string | null>(null)
const impersonationKey = ref<string | null>(null)
const paramNames = ref<string[]>([])
const copied = ref(false)

function refresh() {
    // consume: false everywhere — inspecting must not destroy the records.
    pending.value = readPendingAuthorize({ consume: false })
    rawPending.value = sessionStorage.getItem('px-oidc-pending-authorize')
    impersonationKey.value = readImpersonationKey({ consume: false })
}

const pendingAge = computed(() => {
    if (!rawPending.value) return null

    try {
        const record = JSON.parse(rawPending.value) as { createdAt?: number }

        if (!record.createdAt) return null

        return Math.round((Date.now() - record.createdAt) / 1000)
    }
    catch {
        return null
    }
})

function dropPending() {
    clearPendingAuthorize()
    refresh()
}

function dropImpersonation() {
    clearImpersonationKey()
    refresh()
}

async function copyUrl() {
    await navigator.clipboard.writeText(authorizeUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
}

/* --- impersonation -------------------------------------------------------- */

const impersonationInput = ref('')

const impersonationUrl = computed(
    () => `${origin}/?impersonation_key=${encodeURIComponent(impersonationInput.value)}`,
)

onMounted(async () => {
    paramNames.value = authorizeRequestParamNames()
    refresh()

    if (!form.state) await regeneratePkce()
})
</script>

<template>
    <div class="stack">
        <div>
            <h1>Authorize-Via</h1>
            <p class="lede">
                The OIDC widget can complete an authorize request belonging to another app: it
                captures the parameters into <code>sessionStorage</code>, strips them from the URL,
                replays them on every following mount, and on success redirects the user to
                <em>their</em> <code>redirect_uri</code> rather than ours.
            </p>
        </div>

        <div class="notice">
            <p>
                This is a different thing from the mode switch on <NuxtLink to="/">/</NuxtLink>.
                There, we are either the login host or the relying party for
                <em>ourselves</em>. Here we are the login host for <em>someone else</em>, and
                our own <code>data-client-id</code> / <code>data-redirect-uri</code> are ignored
                for the duration.
            </p>
        </div>

        <!-- Builder ------------------------------------------------------ -->
        <div class="card">
            <h2>Build an authorize request</h2>
            <p class="muted">
                Stands in for the external app. The PKCE pair below is generated in this browser
                because in this flow the verifier belongs to that app — we never see it and never
                validate its <code>state</code>.
            </p>

            <label class="field">
                <span><code>client_id</code></span>
                <input v-model="form.clientId" type="text" spellcheck="false">
            </label>

            <label class="field">
                <span><code>redirect_uri</code> — where the widget will send the user on success</span>
                <input v-model="form.redirectUri" type="text" spellcheck="false">
            </label>

            <label class="field">
                <span><code>scope</code></span>
                <input v-model="form.scope" type="text" spellcheck="false">
            </label>

            <label class="field">
                <span><code>prompt</code> — optional (<code>login</code> / <code>none</code> / <code>select_account</code>)</span>
                <input v-model="form.prompt" type="text" spellcheck="false">
            </label>

            <div class="grid">
                <label class="field">
                    <span><code>state</code></span>
                    <input v-model="form.state" type="text" spellcheck="false">
                </label>

                <label class="field">
                    <span><code>code_challenge</code> (S256)</span>
                    <input v-model="form.codeChallenge" type="text" spellcheck="false">
                </label>
            </div>

            <p>
                <button type="button" class="btn btn--ghost" :disabled="generating" @click="regeneratePkce">
                    {{ generating ? 'Generating…' : 'Regenerate PKCE + state' }}
                </button>
            </p>

            <h3 style="margin-top: 1.25rem">Resulting URL</h3>
            <pre class="code-block">{{ authorizeUrl }}</pre>

            <p v-if="!looksLikeAuthorizeRequest" class="notice notice--danger" style="margin-top: 0.75rem">
                <code>isAuthorizeRequest()</code> says no — the widget will treat this as an
                ordinary visit. It needs <code>response_type=code</code> plus a non-empty
                <code>client_id</code> and <code>redirect_uri</code>.
            </p>

            <p style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap">
                <a class="btn" :href="authorizeUrl">Open on /</a>
                <button type="button" class="btn btn--ghost" @click="copyUrl">
                    {{ copied ? 'Copied' : 'Copy URL' }}
                </button>
            </p>
        </div>

        <!-- keep-params toggle ------------------------------------------- -->
        <div class="card">
            <h2>Stripping behaviour</h2>

            <label class="field field--inline">
                <input v-model="keepAuthorizeParamsInUrl" type="checkbox">
                <span><code>data-keep-authorize-params-in-url</code></span>
            </label>

            <p class="muted">
                Applied to the widget on <NuxtLink to="/">/</NuxtLink>. With it off (the default)
                the widget removes the authorize parameters from the address bar via
                <code>history.replaceState</code>.
            </p>

            <p class="notice">
                <strong>EIP login for external apps does not work with this on.</strong> The
                host script forwards any bare <code>state</code> in the URL as the <em>EIP</em>
                state, so leaving the external app's <code>state</code> in place binds the EIP
                request to the wrong value and the return leg fails validation.
            </p>

            <details style="margin-top: 0.75rem">
                <summary class="muted" style="cursor: pointer">
                    Parameters <code>stripUrlParams()</code> removes ({{ paramNames.length }})
                </summary>
                <p style="margin-top: 0.5rem">
                    <code v-for="name in paramNames" :key="name" style="margin-right: 0.35rem">{{ name }}</code>
                </p>
            </details>
        </div>

        <!-- Inspector ---------------------------------------------------- -->
        <div class="card">
            <h2>Captured request</h2>

            <table class="table">
                <tbody>
                    <tr>
                        <td><code>readPendingAuthorize()</code></td>
                        <td>
                            <span :class="pending ? 'ok' : 'muted'">{{ pending ? 'present' : 'empty' }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>sessionStorage key</td>
                        <td><code>px-oidc-pending-authorize</code></td>
                    </tr>
                    <tr>
                        <td>Age / TTL</td>
                        <td>
                            <template v-if="pendingAge !== null">
                                <code>{{ pendingAge }}s</code> of <code>600s</code>
                            </template>
                            <span v-else class="muted">—</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <pre v-if="pending" class="code-block" style="margin-top: 0.75rem">{{ JSON.stringify(pending, null, 2) }}</pre>

            <p style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap">
                <button type="button" class="btn btn--ghost" @click="refresh">Refresh</button>
                <button type="button" class="btn btn--ghost" :disabled="!pending" @click="dropPending">
                    <code>clearPendingAuthorize()</code>
                </button>
            </p>
        </div>

        <!-- Impersonation ------------------------------------------------ -->
        <div class="card">
            <h2>Impersonation</h2>

            <p class="muted">
                An <code>?impersonation_key=…</code> entry URL. The widget captures the key,
                persists it for 5 minutes and strips it from the address bar — the key is a bearer
                credential, so stripping keeps it out of history and outgoing
                <code>Referer</code> headers.
            </p>

            <p class="muted">
                Persisting is not cosmetic: the host script reads the key from the live URL at
                mount time, but the first mount is regularly spent on an <code>/sso/init</code>
                bounce that reloads the page. Without persistence the key is lost and
                impersonation only works on a second attempt.
            </p>

            <label class="field">
                <span><code>impersonation_key</code></span>
                <input v-model="impersonationInput" type="text" spellcheck="false">
            </label>

            <pre v-if="impersonationInput" class="code-block">{{ impersonationUrl }}</pre>

            <table class="table">
                <tbody>
                    <tr>
                        <td><code>readImpersonationKey()</code></td>
                        <td>
                            <code v-if="impersonationKey">{{ impersonationKey }}</code>
                            <span v-else class="muted">empty</span>
                        </td>
                    </tr>
                    <tr>
                        <td>sessionStorage key</td>
                        <td><code>px-oidc-impersonation-key</code></td>
                    </tr>
                </tbody>
            </table>

            <p style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap">
                <a v-if="impersonationInput" class="btn" :href="impersonationUrl">Open on /</a>
                <button
                    type="button"
                    class="btn btn--ghost"
                    :disabled="!impersonationKey"
                    @click="dropImpersonation"
                >
                    <code>clearImpersonationKey()</code>
                </button>
            </p>
        </div>
    </div>
</template>
