<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { events, log, clear } = useWidgetEventLog()
const widget = ref<{ attrs: Record<string, string> } | null>(null)
</script>

<template>
    <div class="stack">
        <div>
            <h1><code>px-user-forgot-password</code></h1>
            <p class="lede">
                Requests a password reset mail. Success event <code class="tag">success</code>.
            </p>
        </div>

        <div class="notice">
            <p>
                This widget inherits <code>showSuccessMessage = true</code>, so it writes its own
                confirmation into the success span. A host page normally needs no success handler
                at all.
            </p>
        </div>

        <div class="card">
            <PxForgotPassword
                ref="widget"
                container-id="playground-forgot-password"
                @success="log('success', $event)"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />

        <p class="muted">
            Got a code back? Continue at
            <NuxtLink to="/widgets/set-password-by-code">set-password-by-code</NuxtLink>.
        </p>
    </div>
</template>
