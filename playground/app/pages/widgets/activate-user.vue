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
            <h1><code>px-user-activate-user</code></h1>
            <p class="lede">
                Activates an account from an activation token. Success event
                <code class="tag">success</code>.
            </p>
        </div>

        <div class="notice notice--danger">
            <p>
                <strong><code>data-token</code> is enforced.</strong> This widget is built on
                <code>PxUserTokenWidget</code>, which throws when the token is missing — and the
                throw happens inside a promise chain with no <code>.catch</code>, so it surfaces
                as an unhandled rejection in the console rather than something the host page can
                catch. The wrapper is therefore only mounted once a token is present.
            </p>
        </div>

        <div class="card">
            <PxTokenField v-model="token" label="data-token — activation token" />

            <PxActivateUser
                v-if="token"
                ref="widget"
                container-id="playground-activate-user"
                :token="token"
                @success="log('success', $event)"
                @error="log('error', $event)"
                @reset="log('reset', $event)"
                @mounted="log('mounted', $event)"
            />

            <PxWidgetAttrs v-if="widget?.attrs" :attrs="widget.attrs" />
        </div>

        <PxWidgetEventLog :events="events" @clear="clear" />

        <p class="muted">
            Want activation and sign-in in one step?
            <NuxtLink to="/widgets/activate-user-and-login">activate-user-and-login</NuxtLink>.
        </p>
    </div>
</template>
