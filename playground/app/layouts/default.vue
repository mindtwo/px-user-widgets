<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const loggingOut = ref(false)

async function logout() {
    loggingOut.value = true

    try {
        await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
        await clear()
        loggingOut.value = false
        await navigateTo('/')
    }
}
</script>

<template>
    <div class="shell">
        <header class="shell__bar">
            <NuxtLink to="/" class="shell__brand">px-user-widgets <span>playground</span></NuxtLink>

            <nav class="shell__nav">
                <NuxtLink to="/widgets">Widgets</NuxtLink>
                <NuxtLink to="/authorize-via">Authorize-Via</NuxtLink>
                <NuxtLink v-if="loggedIn" to="/dashboard">Dashboard</NuxtLink>
                <NuxtLink v-else to="/login">Login</NuxtLink>
            </nav>

            <div class="shell__session">
                <template v-if="loggedIn">
                    <span class="muted">{{ user?.email ?? user?.preferred_username ?? 'signed in' }}</span>
                    <button type="button" class="btn btn--ghost" :disabled="loggingOut" @click="logout">
                        {{ loggingOut ? 'Signing out…' : 'Sign out' }}
                    </button>
                </template>
                <span v-else class="muted">not signed in</span>
            </div>
        </header>

        <main class="shell__main">
            <slot />
        </main>
    </div>
</template>

<style scoped>
.shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.shell__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.5rem;
    padding: 0.875rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface-1);
}

.shell__brand {
    font-weight: 600;
    text-decoration: none;
    color: var(--text);
}

.shell__brand span {
    color: var(--muted);
    font-weight: 400;
}

.shell__nav {
    display: flex;
    gap: 1rem;
    font-size: 0.9375rem;
}

.shell__nav a {
    color: var(--muted);
    text-decoration: none;
}

.shell__nav a:hover,
.shell__nav a.router-link-active {
    color: var(--accent);
}

.shell__session {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
}

.shell__main {
    flex: 1;
    width: 100%;
    max-width: 62rem;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
}
</style>
