<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

/**
 * The classic username/password widget. No OIDC, no redirect: the widget emits
 * the token pair straight to us on its `login` event, and we hand it to the
 * server to establish a session.
 *
 * Note that <px-user-login> hardcodes placeholder `state` / `client_id` values
 * when its EIP branch is enabled, so the Entra ID button here is for looking at
 * rather than completing — use <px-user-oidc> on `/` for a real EIP round trip.
 */
definePageMeta({ layout: 'auth' })

const { events, log, clear } = useWidgetEventLog()
const { busy, failure, signIn } = useWidgetLogin()

const widget = ref<{ attrs: Record<string, string> } | null>(null)

function onLogin(event: PxUserWidgetEvent) {
    log('login', event)
    signIn(event)
}
</script>

<template>
    <div class="stack">
        <div>
            <h1>Login widget</h1>
            <p class="lede">
                <code>&lt;px-user-login&gt;</code> — success event <code class="tag">login</code>,
                payload on the event object.
            </p>
        </div>

        <div v-if="failure" class="notice notice--danger">
            <p>{{ failure }}</p>
        </div>

        <div class="card">
            <PxLogin
                ref="widget"
                container-id="playground-login"
                @login="onLogin"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <p v-if="busy" class="muted">Establishing the session…</p>

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />

        <p class="muted">
            <NuxtLink to="/">Back to the OIDC flows</NuxtLink> ·
            <NuxtLink to="/widgets/forgot-password">Forgot password</NuxtLink>
        </p>
    </div>
</template>
