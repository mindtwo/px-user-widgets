<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()

// Real apps get this from `?confirm_mail_token=` in a mailed link.
const token = ref(String(route.query.token ?? route.query.confirm_mail_token ?? ''))
const { events, log, clear } = useWidgetEventLog()
const widget = ref<{ attrs: Record<string, string> } | null>(null)
</script>

<template>
    <div class="stack">
        <div>
            <h1><code>px-user-confirm-email</code></h1>
            <p class="lede">
                Confirms a new email address from a token. Success event
                <code class="tag">success</code>.
            </p>
        </div>

        <div class="notice">
            <p>
                Headless in practice — there is no form, the widget just acts on the token, so
                the only visible output is the success or error span. Consumers usually render it
                hidden.
            </p>
            <p>
                <code>data-token</code> is enforced by <code>PxUserTokenWidget</code>: a missing
                token throws as an unhandled rejection, so the widget is only mounted once one is
                present.
            </p>
        </div>

        <div class="card">
            <PxTokenField v-model="token" label="data-token — email confirmation token" />

            <PxConfirmEmail
                v-if="token"
                ref="widget"
                container-id="playground-confirm-email"
                :token="token"
                @success="log('success', $event)"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />
    </div>
</template>
