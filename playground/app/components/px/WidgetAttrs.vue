<script setup lang="ts">
/**
 * Shows the attributes that were actually rendered onto the custom element —
 * the ones the widget read once in connectedCallback. Handy for spotting a
 * value that templated out as the literal string "undefined", or a boolean that
 * became "false" and therefore switched a feature on.
 */
defineProps<{ attrs: Record<string, string | undefined> }>()
</script>

<template>
    <details class="attrs">
        <summary>Attributes in effect ({{ Object.keys(attrs).length }})</summary>

        <table class="table">
            <thead>
                <tr>
                    <th>Attribute</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(value, name) in attrs" :key="name">
                    <td><code>{{ name }}</code></td>
                    <td>
                        <code v-if="value">{{ value }}</code>
                        <span v-else class="warn">empty</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </details>
</template>

<style scoped>
.attrs summary {
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--muted);
}
</style>
