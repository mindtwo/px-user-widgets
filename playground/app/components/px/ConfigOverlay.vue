<script setup lang="ts">
/**
 * Blocks the app when a required px-user value is missing.
 *
 * Deliberately not dismissible: nothing in the playground works without these
 * three, and a widget mounted without them fails with an IdP error that points
 * nowhere useful. Better to say which env var is empty.
 */
const { missing, isConfigured } = usePxUserConfigCheck();
</script>

<template>
    <div v-if="!isConfigured" class="config-overlay">
        <div class="config-overlay__box">
            <h1>Missing px-user configuration</h1>

            <p>
                {{ missing.length }} required
                {{ missing.length === 1 ? 'value is' : 'values are' }} not set.
                Every widget needs all three, and none of them has a usable
                default.
            </p>

            <table class="table">
                <thead>
                    <tr>
                        <th>Env var</th>
                        <th>Attribute</th>
                        <th>What it is</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in missing" :key="entry.envVar">
                        <td><code>{{ entry.envVar }}</code></td>
                        <td><code>{{ entry.attribute }}</code></td>
                        <td class="muted">{{ entry.purpose }}</td>
                    </tr>
                </tbody>
            </table>

            <p class="config-overlay__hint">
                Set them in <code>playground/.env</code> and restart the dev
                server. See <code>.env.example</code>, or
                <code>../docs/oidc-external-app-integration.md</code> §2 for what
                to request from your mindtwo contact.
            </p>

            <p class="config-overlay__hint">
                Left empty, the widget renders the attribute as the literal
                string <code>undefined</code> and the IdP answers
                <code>invalid_client: Client ID "undefined" not found</code> —
                which is why this blocks rather than warns.
            </p>

            <p class="config-overlay__hint">
                Check the rest of the configuration at
                <a href="/api/debug/oidc-discovery" target="_blank">
                    /api/debug/oidc-discovery
                </a>.
            </p>
        </div>
    </div>
</template>

<style scoped>
.config-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: rgb(28 31 36 / 0.55);
    backdrop-filter: blur(3px);
    overflow-y: auto;
}

.config-overlay__box {
    width: 100%;
    max-width: 40rem;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-top: 3px solid var(--danger);
    border-radius: var(--radius);
    padding: 1.5rem 1.75rem;
    box-shadow: 0 12px 40px rgb(0 0 0 / 0.18);
}

.config-overlay__box h1 {
    font-size: 1.25rem;
    color: var(--danger);
}

.config-overlay__hint {
    font-size: 0.875rem;
    color: var(--muted);
    margin: 0.875rem 0 0;
}
</style>
