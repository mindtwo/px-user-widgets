<script setup lang="ts">
import type { LoggedWidgetEvent } from '~/composables/useWidgetEventLog'

/**
 * Live log of everything a widget emitted. This is the main reason the
 * playground exists — it makes the real event names and the real payload shape
 * visible, including the fact that the payload is spread onto the event object
 * and `event.detail` is undefined.
 *
 * Feed it from `useWidgetEventLog()`.
 */
defineProps<{ events: LoggedWidgetEvent[] }>()
const emit = defineEmits<{ clear: [] }>()

const expanded = ref<Set<number>>(new Set())

function toggle(id: number) {
    const next = new Set(expanded.value)

    if (next.has(id)) next.delete(id)
    else next.add(id)

    expanded.value = next
}
</script>

<template>
    <section class="event-log">
        <header class="event-log__header">
            <h3>Event log</h3>
            <button v-if="events.length" type="button" class="btn btn--ghost" @click="emit('clear')">
                Clear
            </button>
        </header>

        <p v-if="!events.length" class="muted">
            Nothing yet. <code>mounted</code> fires once the host script has mounted the iframe.
        </p>

        <table v-else class="table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Payload keys</th>
                    <th><code>.detail</code></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="entry in events" :key="entry.id">
                    <tr class="event-log__row" @click="toggle(entry.id)">
                        <td><code>{{ entry.at }}</code></td>
                        <td><code class="tag">{{ entry.name }}</code></td>
                        <td>
                            <code v-if="Object.keys(entry.payload).length">
                                {{ Object.keys(entry.payload).join(', ') }}
                            </code>
                            <span v-else class="muted">none</span>
                        </td>
                        <td>
                            <span :class="entry.hasDetail ? 'ok' : 'muted'">
                                {{ entry.hasDetail ? 'set' : 'undefined' }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="expanded.has(entry.id)">
                        <td colspan="4">
                            <pre class="code-block">{{ JSON.stringify(entry.payload, null, 2) }}</pre>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </section>
</template>

<style scoped>
.event-log__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.event-log__header h3 {
    margin: 0;
    font-size: 0.9375rem;
}

.event-log__row {
    cursor: pointer;
}

.event-log__row:hover {
    background: var(--surface-2);
}
</style>
