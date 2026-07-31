<script setup lang="ts">
// Narrow, centred shell for the pages that host a widget. The widget element
// must stay under a stable parent, so nothing here animates or reparents it.
</script>

<template>
    <div class="auth">
        <header class="auth__bar">
            <NuxtLink to="/" class="auth__brand">px-user-widgets <span>playground</span></NuxtLink>

            <nav class="auth__nav">
                <NuxtLink to="/widgets">Widgets</NuxtLink>
                <NuxtLink to="/authorize-via">Authorize-Via</NuxtLink>
            </nav>
        </header>

        <main class="auth__main">
            <slot />
        </main>
    </div>
</template>

<style scoped>
.auth {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--surface-0);
}

.auth__bar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.875rem 1.5rem;
    border-bottom: 1px solid var(--border);
}

.auth__brand {
    font-weight: 600;
    text-decoration: none;
    color: var(--text);
}

.auth__brand span {
    color: var(--muted);
    font-weight: 400;
}

.auth__nav {
    margin-left: auto;
    display: flex;
    gap: 1rem;
    font-size: 0.9375rem;
}

.auth__nav a {
    color: var(--muted);
    text-decoration: none;
}

.auth__nav a:hover,
.auth__nav a.router-link-active {
    color: var(--accent);
}

.auth__main {
    flex: 1;
    width: 100%;
    max-width: 44rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
}
</style>
