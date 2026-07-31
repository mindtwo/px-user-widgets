<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

definePageMeta({ layout: 'auth' })

const route = useRoute()

const token = ref(String(route.query.token ?? ''))
const { events, log, clear } = useWidgetEventLog()
const { busy, failure, signIn } = useWidgetLogin()

const widget = ref<{ attrs: Record<string, string> } | null>(null)

/**
 * `.once` matters: the widget can emit `login` more than once if the user
 * resubmits, and a second exchange of the same tokens is pointless.
 */
const handled = ref(false)

function onLogin(event: PxUserWidgetEvent) {
    log('login', event)

    if (handled.value) return

    handled.value = true
    signIn(event)
}
</script>

<template>
    <div class="stack">
        <div>
            <h1><code>px-user-activate-user-and-login</code></h1>
            <p class="lede">
                Activates the account and signs the user in. Success event
                <code class="tag">login</code>.
            </p>
        </div>

        <div v-if="failure" class="notice notice--danger">
            <p>{{ failure }}</p>
        </div>

        <div class="card">
            <PxTokenField
                v-model="token"
                label="data-token — activation token"
                hint="Unlike px-user-activate-user this widget does not throw when the token is missing, but it cannot do anything useful either."
            />

            <PxActivateUserAndLogin
                v-if="token"
                ref="widget"
                container-id="playground-activate-user-and-login"
                :token="token"
                @login="onLogin"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <p v-if="busy" class="muted">Establishing the session…</p>

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />
    </div>
</template>
