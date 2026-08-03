<script setup lang="ts">
import { readPkce } from '@mindtwo/px-user-widgets/oidc';

/**
 * The registered redirect_uri. Handles the return leg of both modes.
 *
 * `ssr: false` because everything here needs sessionStorage and the real address
 * bar. And the query is read from `window.location.search`, not `route.query`:
 * the OIDC widget rewrites the URL with `history.replaceState`, which vue-router
 * never observes, so `route.query` can be stale by the time we get here.
 *
 * The authorization code has a 5 second TTL — this runs the exchange
 * immediately, with no confirmation step in between.
 */
definePageMeta({ layout: 'auth', ssr: false });

const session = useUserSession();

type State = 'working' | 'error';

const state = ref<State>('working');
const step = ref('Reading the callback…');
const mode = ref<'service' | 'widget' | null>(null);
const error = ref<{ title: string; detail?: string; data?: unknown } | null>(
    null,
);

function fail(title: string, detail?: string, data?: unknown) {
    state.value = 'error';
    error.value = { title, detail, data };
}

onMounted(async () => {
    const params = new URLSearchParams(window.location.search);

    const idpError = params.get('error');

    if (idpError) {
        // login_required, access_denied, account_selection_required, …
        return fail(idpError, params.get('error_description') ?? undefined);
    }

    const code = params.get('code');
    const returnedState = params.get('state');

    if (!code) {
        return fail(
            'No authorization code',
            'The callback carried neither `code` nor `error`. If you opened this URL ' +
                'directly, start again from the sign-in page.',
        );
    }

    // `state` decides the mode, not the presence of a verifier: the widget
    // writes a PKCE pair into sessionStorage on every mount of the sign-in page,
    // so one is sitting there even when the login that actually ran was the
    // service flow. Only a callback carrying the state we stored is the widget's.
    //
    // readPkce() consumes by default, which is what we want either way — one
    // login attempt, one verifier.
    const { verifier, state: storedState } = readPkce();

    step.value = 'Validating state…';

    if (verifier && storedState && storedState === returnedState) {
        mode.value = 'widget';
    } else {
        // Not ours — the server should be holding the verifier for this `state`,
        // and it validates the match itself. Anything we read above was stale.
        mode.value = 'service';
    }

    step.value = 'Exchanging the code for tokens…';

    try {
        const result = await $fetch<{ mode: 'service' | 'widget' }>(
            '/api/auth/oidc-callback',
            {
                method: 'POST',
                body: {
                    code,
                    state: returnedState ?? undefined,
                    // Only in widget mode: a stale verifier would make the server
                    // exchange this code against a PKCE pair it was never bound to.
                    code_verifier:
                        mode.value === 'widget' ? verifier : undefined,
                },
            },
        );

        mode.value = result.mode;
    } catch (err) {
        const e = err as {
            statusMessage?: string;
            data?: { statusMessage?: string; data?: unknown };
        };

        return fail(
            e.data?.statusMessage ?? e.statusMessage ?? 'Token exchange failed',
            undefined,
            e.data?.data,
        );
    }

    step.value = 'Loading your session…';
    await session.fetch();

    if (!session.loggedIn.value) {
        return fail(
            'The session did not stick',
            'The token exchange succeeded but no session was established.',
        );
    }

    await navigateTo('/dashboard');
});
</script>

<template>
    <div class="stack">
        <template v-if="state === 'working'">
            <h1>Signing you in…</h1>
            <p class="lede">{{ step }}</p>
            <p v-if="mode" class="muted">
                Resolved flow: <code class="tag">{{ mode }}</code>
                <template v-if="mode === 'widget'">
                    — PKCE verifier came from
                    <code>sessionStorage</code></template
                >
                <template v-else>
                    — PKCE verifier came from the server session</template
                >
            </p>
        </template>

        <template v-else>
            <h1>Sign-in failed</h1>

            <div class="notice notice--danger">
                <p>
                    <strong>{{ error?.title }}</strong>
                </p>
                <p v-if="error?.detail">{{ error.detail }}</p>
            </div>

            <p v-if="mode" class="muted">
                Resolved flow: <code class="tag">{{ mode }}</code>
            </p>

            <pre v-if="error?.data" class="code-block">{{
                JSON.stringify(error.data, null, 2)
            }}</pre>

            <p>
                <NuxtLink class="btn" to="/?prompt=login"
                    >Back to sign in</NuxtLink
                >
            </p>

            <p class="muted">
                A repeated failure here is usually configuration rather than
                code — check
                <code>/api/debug/oidc-discovery</code>, and that
                <code>{{ $config.public.appUrl }}/callback</code> is registered
                as an exact-match redirect_uri.
            </p>
        </template>
    </div>
</template>
