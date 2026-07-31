<script setup lang="ts">
/**
 * Shell every widget renders into.
 *
 * <ClientOnly> because the package can only be imported in the browser, and a
 * min-height because the widget's iframe has no intrinsic size until the host
 * script has mounted it.
 *
 * The wrapping div also matters structurally: the widget has no
 * disconnectedCallback, and re-firing connectedCallback appends a *second* root
 * container and mounts a *second* iframe. So the element must stay put — never
 * put a widget inside <Teleport>, <KeepAlive> or a transition that reparents it.
 */
withDefaults(defineProps<{ minHeight?: string }>(), { minHeight: '320px' })
</script>

<template>
    <div class="widget-host" :style="{ minHeight }">
        <ClientOnly>
            <template #fallback>
                <p class="widget-host__fallback">Loading widget…</p>
            </template>

            <slot />
        </ClientOnly>
    </div>
</template>

<style scoped>
.widget-host {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.widget-host__fallback {
    margin: 0;
    padding: 1rem 0;
    color: var(--muted);
    font-size: 0.875rem;
}
</style>
