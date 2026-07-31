<script setup lang="ts">
import type { PxUserWidgetEvent } from '~/composables/usePxUserWidget'

definePageMeta({ layout: 'auth' })

const route = useRoute()

// Optional here: the usual flow is for the user to type the code into the form.
const token = ref(String(route.query.token ?? ''))
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
            <h1><code>px-user-set-password-by-forgot-password-code-and-login</code></h1>
            <p class="lede">
                The user enters the reset code plus a new password, and is signed in straight
                away. Success event <code class="tag">login</code>.
            </p>
        </div>

        <div v-if="failure" class="notice notice--danger">
            <p>{{ failure }}</p>
        </div>

        <div class="card">
            <PxTokenField
                v-model="token"
                label="data-token — optional"
                hint="Leave empty to let the user type the code into the widget's own field."
                :required="false"
            />

            <PxSetPasswordByCodeAndLogin
                ref="widget"
                container-id="playground-set-password-by-code"
                :token="token || undefined"
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
