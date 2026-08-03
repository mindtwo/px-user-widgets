---
name: nuxt-runtime-debug
description: Instrument a Nuxt app so client-side and server-side runtime errors land in one correlated log file that Claude can read directly. Use this whenever the user is debugging a Nuxt or Vue app in the browser — hydration mismatches, "it works in dev but not after reload", blank pages, failing useFetch/$fetch calls, console errors they can't reproduce, or any request where they describe a browser symptom and expect Claude to find the cause in the source. Especially relevant when the browser is Firefox or Safari, where no Claude browser extension exists and Claude cannot see the console at all. Also use when the user asks to "look at the console", "check the network tab", pastes a stack trace from a browser, or asks how to give Claude visibility into their running frontend.
---

# Nuxt runtime debugging

## The problem this solves

Claude cannot see a browser. When a user reports "the page breaks on reload", the useful evidence lives in three places Claude has no access to: the browser console, the network tab, and the dev server's stdout. Guessing from source alone produces plausible-sounding wrong answers.

This skill installs a dev-only bridge so all three streams append to `.nuxt/agent.log` as JSON lines, tagged with a shared request id. Claude then reads the log and the source at the same time, which is the whole point — a stack trace is only useful next to the component that produced it.

The Chrome extension is not an option in Firefox or Safari, and Playwright cannot attach to an already-running stock Firefox (it ships its own patched build; Firefox's CDP was deprecated in favour of WebDriver BiDi). So for "reproduce it in *my* browser with *my* session", file-based logging is the only reliable path.

## Workflow

### 1. Check whether instrumentation is already installed

```bash
ls .nuxt/agent.log server/plugins/agent-log.ts plugins/agent-log.client.ts 2>/dev/null
```

If the log already exists, skip to step 4. Do not reinstall on top of an existing setup.

### 2. Install the four files

Copy from this skill's `assets/` into the project root, preserving structure:

| Asset | Destination | Purpose |
|---|---|---|
| `assets/plugins/agent-log.client.ts` | `plugins/agent-log.client.ts` | console, uncaught errors, rejections, `vue:error`, failed fetches |
| `assets/plugins/agent-log-ssr.server.ts` | `plugins/agent-log-ssr.server.ts` | Vue errors thrown during SSR |
| `assets/server/plugins/agent-log.ts` | `server/plugins/agent-log.ts` | request timing, Nitro errors, process-level crashes, request id |
| `assets/server/routes/__agent-log.post.ts` | `server/routes/__agent-log.post.ts` | sink that appends client entries to the log |

Adjust paths for a `srcDir` setup (Nuxt 4 defaults to `app/plugins/`, `server/` stays at root). Check `nuxt.config.ts` and the existing directory layout before copying rather than assuming.

Then tell the user to restart the dev server with output captured, because Vite's SSR transform errors go to stdout and never reach the log file:

```bash
npm run dev 2>&1 | tee .nuxt/dev.log
```

### 3. Ask the user to reproduce the bug

Be specific about what you need: the URL, whether it happens on first load or after client navigation, and whether they should hard-reload. Wait for them. Don't start theorising while there's no data.

### 4. Read the evidence before forming a hypothesis

```bash
# most recent entries
tail -n 100 .nuxt/agent.log | python3 -m json.tool --json-lines 2>/dev/null || tail -n 100 .nuxt/agent.log

# everything for one request, client and server interleaved
python3 scripts/trace.py .nuxt/agent.log --rid a3f91c02

# errors only
python3 scripts/trace.py .nuxt/agent.log --errors

# server-side compile/transform errors
tail -n 50 .nuxt/dev.log
```

`scripts/trace.py` sorts by timestamp and prints client and server lines together, which is what makes an SSR-versus-client divergence visible.

### 5. Interpret with Nuxt-specific priors

Read the log first, then match against these. Do not skip to a fix before the log supports it.

- **Hydration mismatch** (`vue:error` client-side, no matching server error) — look for `Date`, `Math.random`, `window`/`localStorage` access during render, `v-if` on a value that differs between SSR and client, or an unkeyed list. Check `useState` vs plain `ref` for anything that must survive the payload.
- **Client error with no server counterpart** — the failure is in a client-only branch. Check `import.meta.client` guards and `.client.vue` components.
- **Server error, blank page, no client entries** — SSR threw before hydration. `.nuxt/dev.log` has the real stack.
- **`http` entries with 500 and a `rid`** — trace that rid to the server entry; the API handler is the cause, not the component.
- **Repeated identical requests** — usually a `useAsyncData` key collision or a watcher loop, not a caching bug.
- **Slow `ms` values on the server** — an unawaited or serially awaited data source in the route.

Confirm the diagnosis against the source before proposing a change. State which log line supports it.

### 6. Clean up when done

The instrumentation is dev-only and harmless, but offer removal once the bug is fixed, and delete `.nuxt/agent.log` if the user was signed in as a real account during reproduction.

## When something has to happen in a browser

Clicking a link, watching a redirect, confirming what the address bar says. Two options, in this order — the second is never the opening move.

### 1. Ask the user to do it and report back — always first

Name the exact steps and the exact observations you need, then stop and wait:

- the URL to open, and whether to hard-reload
- what to click, in order
- what to read back: the address bar after the click, the visible error text, whether the page changed at all

Their browser has the real session, the real profile and the real browser version — the three things a driven browser cannot supply. It is also the configuration the bug was reported against.

Don't theorise while waiting, and don't reach for a browser of your own because the answer is slow in coming.

### 2. Ask whether you may use Playwright — only after the first is exhausted

Justified when step 1 cannot produce the answer: the user is away, the bug needs a clean profile, or the reproduction needs more iterations than anyone should run by hand.

Ask before installing anything, and let the user choose the engine — offer Firefox and Chromium as explicit options rather than picking one:

```bash
# Firefox
claude mcp add playwright -- npx @playwright/mcp@latest --browser=firefox

# Chromium
claude mcp add playwright -- npx @playwright/mcp@latest --browser=chromium
```

Add `--user-data-dir=./.pw-firefox` (or `./.pw-chromium`) to persist a login across runs.

This is a complement, not a replacement. It cannot reproduce anything that depends on the user's real profile, extensions or installed browser version, and Playwright ships its own patched Firefox build — it cannot attach to a stock Firefox that is already running.

## Privacy constraints

These are not optional; the log is a plain file that often ends up in a screenshot or a pasted snippet.

- Keep every `import.meta.dev` guard intact. Nothing may ship to production.
- Never log request bodies, cookies, or `authorization` headers. The server plugin allowlists headers — extend the allowlist explicitly rather than removing the filter.
- If the user needs body inspection for one endpoint, add a narrow redacting logger there instead of widening the global one.
