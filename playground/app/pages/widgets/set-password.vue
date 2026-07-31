<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()

const token = ref(String(route.query.token ?? ''))
const { events, log, clear } = useWidgetEventLog()
const widget = ref<{ attrs: Record<string, string> } | null>(null)

const done = ref(false)
</script>

<template>
    <div class="stack">
        <div>
            <h1><code>px-user-set-password</code></h1>
            <p class="lede">
                Sets a new password for a reset token. Success event
                <code class="tag">success</code>.
            </p>
        </div>

        <div class="card">
            <PxTokenField
                v-model="token"
                label="data-token — reset token"
                hint="In a real app this comes from the route param in the mailed link."
            />

            <PxSetPassword
                v-if="token"
                ref="widget"
                container-id="playground-set-password"
                :token="token"
                @success="log('success', $event); done = true"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <div v-if="done" class="notice notice--ok">
            <p>
                Password set. This widget does <em>not</em> log the user in — it only emits
                <code>success</code>. Sign in at <NuxtLink to="/login">/login</NuxtLink>.
            </p>
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />
    </div>
</template>
