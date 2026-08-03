# px-user-widgets playground

A Nuxt 4 app that exercises `@mindtwo/px-user-widgets` against the real px-user
API — one page per widget, plus both sides of the OIDC integration side by side.

It consumes the package from the repo root via `"@mindtwo/px-user-widgets": "file:.."`,
so it tests the same entry points a published install would resolve.

## Setup

```bash
# 1. Build the package — the playground resolves dist/, not src/
cd .. && npm run build && cd playground

# 2. Install
npm install

# 3. Configure
cp .env.example .env   # then fill it in

# 4. Run
npm run dev
```

> **After changing anything in `../src/`, re-run `npm run build` in the repo
> root.** The symlink points at the package directory, and its `exports` map
> resolves to `dist/` — the playground never sees `src/`.

`NUXT_PUBLIC_PX_USER_TENANT`, `NUXT_PUBLIC_PX_USER_DOMAIN` and
`NUXT_PUBLIC_PX_USER_CLIENT_ID` are **required** — every widget needs all three
and none has a usable default. Leave any of them empty and a blocking overlay
names the missing env var. That is deliberate: without them the widget still
mounts, renders the attribute as the literal string `undefined`, and the IdP
answers `invalid_client: Client ID "undefined" not found`, which points nowhere
useful.

You also need the `{context}` tenant prefix for the token exchange — no client
secret, the endpoint authenticates with PKCE alone
(`../docs/oidc-external-app-integration.md` §2 lists everything to request) —
and `http://localhost:3000/callback` must be registered as an
**exact-match** `redirect_uri` — an unregistered one fails before the login form
renders.

When something doesn't work, start here:

```bash
curl -s localhost:3000/api/debug/oidc-discovery | jq
```

It reports the resolved config and the discovery document, so a wrong
`NUXT_PX_USER_CONTEXT` or host shows up before any UI is involved.

## Routes

| Route | What it does |
|---|---|
| `/` | `<px-user-oidc>`, with a **Use Auth as a Service to authenticate** button beneath it for the other flow. Also shows the Authorize-Via status. |
| `/callback` | The registered `redirect_uri`. Handles the return leg of both modes. |
| `/dashboard` | Profile card from the px-user API. Requires a session. |
| `/login` | `<px-user-login>` — classic username/password. |
| `/authorize-via` | Builder + inspector for the login-as-a-service authorize proxy. |
| `/widgets` | Index of the authentication elements the package registers. |
| `/widgets/*` | One page per remaining widget, each with an event log. |

## The two OIDC flows

Both end at `/callback`, which decides what to do by asking who holds the PKCE
verifier.

**Direct widget login** — the default path on `/`. We host the login form
(`../docs/oidc-integration.md`). `<px-user-oidc>` mints its own PKCE into
`sessionStorage` and redirects from inside its iframe. The callback page reads
the verifier back with `readPkce()` and validates `state` client-side before
posting.

**Auth as a Service** — the button below the widget. We are the relying party
(`../docs/oidc-external-app-integration.md`). No widget is involved: Nitro mints
the PKCE pair, keeps the verifier in the sealed session cookie, and redirects the
browser to `NUXT_PX_USER_AUTHORIZATION_URL`. `state` is validated server-side and
the pending record is single-use. Leave that env var empty and the button is
disabled with a hint.

The code-for-token exchange is server-side in both cases. Not because of a
secret — there isn't one — but so the tokens land in the sealed session cookie
instead of in browser memory. `server/api/auth/oidc-callback.post.ts` is the
only place it happens.

## Wrapper components

`app/components/px/` has one wrapper per authentication element the package
registers (`px-user-eip-config` is out of scope — it is an admin surface for
entering Azure credentials, not an auth flow), plus:

- `WidgetHost.vue` — `<ClientOnly>` shell with a min-height
- `WidgetEventLog.vue` — every event a widget fired, with its real payload
- `WidgetAttrs.vue` — the attributes actually rendered onto the element
- `TokenField.vue` — token entry for the widgets that need one

Shared logic is in `app/composables/usePxUserWidget.ts`. The wrappers are
written to be copied into real projects, so they carry the reasoning for the
non-obvious parts in comments. The short version:

1. **Register client-side only.** The package does `extends HTMLElement` at
   module eval, which throws in Node. `app/plugins/px-user-widgets.client.ts`
   uses a dynamic `await import()` so that `window.PX_WIDGETS_VERBOSITY` — read
   at module-eval time — can be set first.
2. **The host script is mandatory** and is not part of the npm package. Widgets
   wait on `window.PxModUser` by polling every 100 ms, forever, with no timeout
   and no rejection. The plugin warns in dev if it never shows up, because
   otherwise a missing script looks like a widget that renders nothing.
3. **Attributes are read once**, in `connectedCallback`. There is no
   `observedAttributes`, so changing a bound attribute after mount does nothing —
   every wrapper keys the element on its own attributes to force a fresh one.
4. **Use kebab-case `data-*`.** `data-containerId` is a trap: the DOM lowercases
   attribute names and `camelCase('containerid') === 'containerid'`, so the
   widget never finds the key and silently falls back to its default.
5. **Payloads are on the event object, not `event.detail`.** The package builds
   `class PxUserEvent extends Event` and `Object.assign`s the payload onto the
   instance. The event log surfaces this explicitly.
6. **Listen with `addEventListener`, not `@success` / `@error`.** The events
   bubble and are `composed`, and those names collide with native DOM events —
   `@error` would also catch resource errors from the widget's own iframe.
7. **Don't move the element.** There is no `disconnectedCallback`, so anything
   that re-fires `connectedCallback` (`<Teleport>`, `<KeepAlive>`, a reparenting
   transition) appends a second container and mounts a second iframe.
8. **Guard middleware on `isOidcHandshakeInFlight()`.** The widget redirects from
   inside its iframe and rewrites the URL with `history.replaceState`, neither of
   which the app can intercept. A route guard that redirects mid-handshake kills
   the login silently. For the same reason, read `window.location.search` rather
   than `route.query` after mount.

## Styling

Two separate stylesheets, and the distinction matters:

- `public/css/px-user.css` is loaded **into the widget's iframe**. Each widget
  resolves `data-css-path` against `data-app-url`, so
  `data-app-url=http://localhost:3000` + `data-css-path=css/px-user.css` makes
  the widget fetch it from this app's own origin. Edit and reload to restyle the
  widget. The host page's CSS does not reach inside.
- `app/assets/css/main.css` styles the host page, including the light-DOM markup
  the widget appends outside the iframe (`.user-component`, `.error-message`,
  `.success-message`).

No labels are overridden anywhere — every widget runs with the copy the package
ships, so what you see is the default.
