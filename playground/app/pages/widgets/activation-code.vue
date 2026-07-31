<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()

const token = ref(String(route.query.token ?? ''))
const { events, log, clear } = useWidgetEventLog()
const widget = ref<{ attrs: Record<string, string> } | null>(null)
</script>

<template>
    <div class="stack">
        <div>
            <h1><code>px-user-activate-user-with-activation-code</code></h1>
            <p class="lede">
                Activation by code. Success event <code class="tag">activated</code> — not
                <code>success</code>.
            </p>
        </div>

        <div class="notice">
            <p>
                Two behaviours to watch for. The widget installs
                <code>onSuccessActivationCode</code> / <code>onErrorActivationCode</code>
                callbacks that write straight into the message spans and <strong>emit
                nothing</strong>, so the code-validation step is invisible in the log below —
                only the final activation shows up, as <code>activated</code>.
            </p>
            <p>
                It is also the only widget in this family that does not set
                <code>config.icons</code>, so there is no show/hide toggle on its password
                fields.
            </p>
        </div>

        <div class="card">
            <PxTokenField
                v-model="token"
                label="data-token — optional"
                hint="Leave empty to let the user type the activation code into the widget."
                :required="false"
            />

            <PxActivationCode
                ref="widget"
                container-id="playground-activation-code"
                :token="token || undefined"
                @activated="log('activated', $event)"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />
    </div>
</template>
