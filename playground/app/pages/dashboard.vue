<script setup lang="ts">
import type { PxUserProfile } from '~~/shared/types/px-user'

/**
 * Proof that the whole chain works: session cookie → access token → px-user API.
 *
 * The profile is fetched fresh through /api/me rather than read off the session,
 * so what you see is what the API returns right now.
 */
const { session, user } = useUserSession()

const { data, error, refresh, status } = await useFetch<{
    source: string
    profile: PxUserProfile
}>('/api/me')

const profile = computed(() => data.value?.profile ?? user.value ?? {})

const fullName = computed(() => {
    const parts = [profile.value.firstname, profile.value.lastname].filter(Boolean)

    return parts.length ? parts.join(' ') : (profile.value.preferred_username ?? profile.value.email ?? '—')
})

const fields = computed(() => [
    { label: 'Email', value: profile.value.email },
    { label: 'Username', value: profile.value.preferred_username },
    { label: 'User ID', value: profile.value.id },
    { label: 'Tenant', value: profile.value.tenant_code },
    { label: 'Domain', value: profile.value.domain_code },
    { label: 'Locale', value: profile.value.locale },
    { label: 'Source', value: profile.value.source },
    { label: 'Last login', value: profile.value.last_login_at },
    { label: 'Activated', value: profile.value.activated_at },
    {
        label: 'Confirmed',
        value: profile.value.is_confirmed === undefined ? undefined : String(profile.value.is_confirmed),
    },
    {
        label: 'Enabled',
        value: profile.value.is_enabled === undefined ? undefined : String(profile.value.is_enabled),
    },
])
</script>

<template>
    <div class="stack">
        <div>
            <h1>Dashboard</h1>
            <p class="lede">
                Signed in via <code class="tag">{{ session?.loginMode ?? 'unknown' }}</code>.
                Access and refresh tokens are held in the sealed session cookie and are never
                sent to the browser.
            </p>
        </div>

        <div v-if="error" class="notice notice--danger">
            <p><strong>Could not load the profile.</strong> {{ error.statusMessage ?? error.message }}</p>
            <p>
                <button type="button" class="btn btn--ghost" @click="refresh()">Retry</button>
            </p>
        </div>

        <div class="card">
            <header class="profile__head">
                <div class="profile__avatar">{{ fullName.slice(0, 1).toUpperCase() }}</div>
                <div>
                    <h2>{{ fullName }}</h2>
                    <p class="muted" style="margin: 0">{{ profile.email ?? '—' }}</p>
                </div>
                <button
                    type="button"
                    class="btn btn--ghost"
                    style="margin-left: auto"
                    :disabled="status === 'pending'"
                    @click="refresh()"
                >
                    {{ status === 'pending' ? 'Refreshing…' : 'Refresh' }}
                </button>
            </header>

            <table class="table">
                <tbody>
                    <tr v-for="field in fields" :key="field.label">
                        <th scope="row">{{ field.label }}</th>
                        <td>
                            <code v-if="field.value">{{ field.value }}</code>
                            <span v-else class="muted">—</span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Session expires</th>
                        <td>
                            <code v-if="session?.expiresAt">{{ session?.expiresAt }}</code>
                            <span v-else class="muted">not reported by the token response</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Raw response</h2>
            <p class="muted">
                Straight from <code>{{ data?.source ?? 'the px-user API' }}</code>, unmodified —
                the field names here are the API's, not the playground's.
            </p>
            <details>
                <summary class="muted" style="cursor: pointer">Show JSON</summary>
                <pre class="code-block" style="margin-top: 0.75rem">{{ JSON.stringify(profile, null, 2) }}</pre>
            </details>
        </div>
    </div>
</template>

<style scoped>
.profile__head {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.profile__head h2 {
    margin: 0;
}

.profile__avatar {
    width: 3rem;
    height: 3rem;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--accent-weak);
    color: var(--accent);
    font-weight: 600;
    font-size: 1.25rem;
}

.table th[scope='row'] {
    width: 11rem;
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.875rem;
    color: var(--muted);
    font-weight: 500;
}
</style>
