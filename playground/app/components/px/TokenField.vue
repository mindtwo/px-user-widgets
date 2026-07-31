<script setup lang="ts">
/**
 * Token entry for the widgets that need one.
 *
 * Real apps get the token from a route param in a mailed link. In the playground
 * you paste it, so `?token=…` prefills and the field stays editable. The widget
 * is only mounted once there is a value — a couple of them throw an unhandled
 * rejection when `data-token` is missing.
 */
const model = defineModel<string>({ required: true })

withDefaults(
    defineProps<{
        label?: string
        hint?: string
        required?: boolean
    }>(),
    { label: 'Token', required: true },
)
</script>

<template>
    <div class="token-field">
        <label class="field">
            <span>{{ label }}</span>
            <input v-model="model" type="text" spellcheck="false" autocomplete="off" placeholder="Paste a token…">
        </label>

        <p v-if="hint" class="muted" style="margin-top: -0.5rem">{{ hint }}</p>

        <p v-if="required && !model" class="notice">
            The widget is not mounted yet — enter a token above, or open this page with
            <code>?token=…</code>.
        </p>
    </div>
</template>
