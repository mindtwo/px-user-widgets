# px-user OIDC widget — integration brief

> Building the **other** side — an app that sends users to a mindtwo-hosted login UI and gets them back with a code? You don't need
> the widget. See [`oidc-external-app-integration.md`](./oidc-external-app-integration.md).

You're integrating `@mindtwo/px-user-widgets`' OIDC login widget into this frontend. The widget renders the PX-User OIDC sign-in form and kicks off the Authorization Code + PKCE flow against the PX-User authorize endpoint. Your app is responsible for handling the redirect callback and exchanging the code for tokens.

## 1. Install + bootstrap

```bash
npm i @mindtwo/px-user-widgets
```

In the bundle entry (e.g. `main.js`):

```js
import '@mindtwo/px-user-widgets';
```

In the main HTML view, load the PX-User host script and env vars:

```html
<script src="https://user-frontend.api.pl-x.cloud/js/widget.js"></script>
<script>
    window.PX_USER_DOMAIN = '...'; // from config
    window.PX_USER_TENANT = '...';
    window.PX_USER_STAGE  = '...';
</script>
```

## 2. Mount the widget

```html
<px-user-oidc
    data-container-id="oidc-login"
    data-app-url="https://user-frontend.api.pl-x.cloud"
    data-client-id="YOUR_CLIENT_ID"
    data-redirect-uri="https://your-app.example/auth/callback"
    data-scope="openid profile email"
></px-user-oidc>
```

Required: `data-client-id`. Everything else has a sensible default.

### Attribute reference

| Attribute | Default | Purpose |
|---|---|---|
| `data-client-id` | — (**required**) | OIDC client ID from your registration |
| `data-redirect-uri` | `${window.location.origin}` | Where the IdP redirects after auth. Set this explicitly — the default is the bare origin, and the IdP rejects any value that isn't registered |
| `data-scope` | `openid` | Space-separated scopes. Use `openid profile email` for typical apps; add `offline_access` for refresh tokens |
| `data-response-type` | `code` | Authorization Code flow — leave as is |
| `data-code-challenge` | auto-generated | Pass only if you want to manage PKCE yourself |
| `data-code-challenge-method` | `S256` | Don't change |
| `data-state` | auto-generated | Pass only if you want to manage state yourself |
| `data-prompt` | — | `login` / `none` / `select_account` |
| `data-form-title` | — | Custom form heading |
| `data-logo-url` / `data-favicon-url` | — | Branding |
| `data-show-spinner` | — | Loading indicator |
| `data-show-login-with-eip` | `false` | Show the EIP login button |
| `data-eip-login-redirect-uri` | `${window.location.origin}` | Where EIP returns the user. Must be registered in the EIP config, and must be a route that mounts this widget |
| `data-impersonation-key` | from `?impersonation_key` | Pass explicitly to override the URL |
| `data-keep-authorize-params-in-url` | `false` | Keep a proxied authorize request in the address bar (see §7) — breaks EIP login for external apps |
| `data-verifier-storage-key` | `px-oidc-verifier` | sessionStorage key for the PKCE verifier |
| `data-state-storage-key` | `px-oidc-state` | sessionStorage key for the state value |
| `data-challenge-storage-key` | `px-oidc-challenge` | sessionStorage key for the PKCE challenge |
| `data-pending-request-storage-key` | `px-oidc-pending-authorize` | sessionStorage key for a proxied authorize request |
| `data-impersonation-storage-key` | `px-oidc-impersonation-key` | sessionStorage key for the impersonation key |

Container env attrs (any widget): `data-app-url`, `stage`, `tenant`, `domain` — or set the matching `window.PX_USER_*` globals once.

> ⚠️ Common pitfall: if you template values into the attributes (`data-client-id="{{ clientId }}"`), make sure the variable is actually defined. Otherwise the attribute renders as the literal string `undefined` and the IdP returns `invalid_client: Client ID "undefined" not found`.

## 3. PKCE + state handling

By default the widget auto-generates a PKCE verifier/challenge pair and a random `state`, then stores `verifier`, `state` and `challenge` in `sessionStorage` (keys `px-oidc-verifier`, `px-oidc-state`, `px-oidc-challenge`). You don't need to do anything before mounting.

The challenge is stored because the authorization request may have to be re-issued on a later page load — the EIP login bounces back through this page. On that second mount the widget restores all three instead of regenerating, so the request stays bound to the same verifier.

Override only if you want to manage it yourself by passing `data-code-challenge` and `data-state` explicitly.

## 4. Handle the callback

At your `redirect_uri` page, read `code` and `state` from the URL, verify state, and exchange the code for tokens:

```js
// Subpath import — pulls in helpers only, no custom element side effects.
import { readPkce } from '@mindtwo/px-user-widgets/oidc';

const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const returnedState = params.get('state');

// readPkce() pulls verifier+state from sessionStorage and clears them.
// Pass { consume: false } to keep them.
const { verifier, state } = readPkce();

if (!state || state !== returnedState) {
    throw new Error('OIDC state mismatch — possible CSRF, abort');
}

// Exchange the code for tokens — endpoint + payload depend on your backend.
// Typical token request body:
const body = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    code_verifier: verifier,
    client_id:     'YOUR_CLIENT_ID',
    redirect_uri:  'https://your-app.example/auth/callback',
});

const res = await fetch('https://.../oidc/v1.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
});
const tokens = await res.json(); // { access_token, id_token, refresh_token?, ... }
```

The authorization `code` from the IdP has a **5-second TTL**, so do the exchange immediately on the callback page.

## 5. Events

The element fires DOM CustomEvents on success/error, same as the other px-user widgets:

```js
const el = document.querySelector('px-user-oidc');
el.addEventListener('login', (e) => console.log('oidc login', e.detail));
el.addEventListener('error', (e) => console.warn('oidc error', e.detail));
```

## 6. Constraints / gotchas

- The widget itself does **not** do the token exchange — that's your callback handler's job.
- The widget does **not** validate the `id_token` signature — do that server-side or with a JOSE library.
- `sessionStorage` is per-tab; if your callback runs in a different tab, switch to `localStorage` and clean it up yourself.
- The auth `code` expires in 5s; debounce nothing on the callback path.
- `scope` must be non-empty; default `openid` is the minimum.
- The final redirect is performed by the PX-User host script from inside the iframe (`window.location.href = …`). Your app cannot intercept or veto it — so your own routing must not race it, see §7.

## 7. Serving other apps (login-as-a-service)

The widget can complete an authorization request that belongs to **another** app. The external app sends the user to the page that
mounts this widget with a full authorize query:

```
https://your-app.example/?response_type=code&client_id=THEIR_CLIENT
    &redirect_uri=https://their-app.example/auth/callback
    &scope=openid+profile+email&state=…&code_challenge=…&code_challenge_method=S256
```

The widget then:

1. **captures** those parameters into `sessionStorage` (key `px-oidc-pending-authorize`, 10 minute TTL),
2. **strips** them from the URL via `history.replaceState`,
3. **replays** them on every following mount, and redirects the user to *their* `redirect_uri` when login succeeds.

Your own `data-client-id` / `data-redirect-uri` are ignored for the duration, and your PKCE storage is left untouched — the
`code_verifier` belongs to the external app, and neither the `code` nor the `state` is yours to validate.

Steps 1–3 are what make **EIP login work for external apps.** The EIP round-trip returns to your page with the identity provider's
own `code`/`state` and nothing else, so a request that only lived in the URL is gone by then. Two further reasons the URL is
stripped rather than kept:

- The host script forwards any bare `state` in the URL as the *EIP* state, so leaving the external app's `state` in place binds the
  EIP request to the wrong value and the return leg fails validation.
- The host script's `/sso/init` bounce reloads the page and discards its resolved config, so the URL is not a reliable carrier
  anyway.

`data-keep-authorize-params-in-url` disables the stripping if your app needs to read those parameters itself. EIP login for
external apps will not work with it on.

### Callback handling in this mode

Your callback page never runs — the user is redirected to the external app's `redirect_uri`. But your middleware does run, and
must not redirect the user away mid-handshake:

```js
import { isOidcHandshakeInFlight, clearPendingAuthorize } from '@mindtwo/px-user-widgets/oidc';

// In your route guard / middleware:
if (isOidcHandshakeInFlight()) {
    return; // no access redirects, no store init — let the handshake finish
}
```

`isOidcHandshakeInFlight()` is true for an authorize request, for a redirect back from the IdP (`code` / `error`), and for an
`?impersonation_key=…` entry URL. It reads the URL only, so it is safe to call during SSR.

Available from `@mindtwo/px-user-widgets/oidc`:

| Helper | Purpose |
|---|---|
| `isOidcHandshakeInFlight(search?)` | Any handshake in progress — use this in middleware |
| `isAuthorizeRequest(search?)` | The URL carries an authorize request from another app |
| `isOidcReturn(search?)` | The URL is a redirect back from the IdP (`code` / `error`) |
| `readPendingAuthorize()` / `hasPendingAuthorize()` | Inspect the captured request (client-side only) |
| `clearPendingAuthorize()` | Drop it — e.g. once your own login completes |
| `readPkce()` / `clearPkce()` / `challengeFromVerifier()` | PKCE storage |
| `readImpersonationKey()` / `clearImpersonationKey()` | Impersonation key storage |

`isAuthorizeRequest` deliberately mirrors the host script's own test (`response_type === 'code'` plus a `client_id` and a
`redirect_uri`) so your middleware and the widget can never disagree about which mode a request is in.

## 8. Impersonation

Send the user to a page that mounts the widget with `?impersonation_key=…`, or pass `data-impersonation-key` explicitly.

The widget captures the key, persists it (`px-oidc-impersonation-key`, 5 minute TTL) and strips it from the URL. Persisting is
required, not cosmetic: the host script reads the key from the live URL at mount time, but the first mount is regularly spent on
the `/sso/init` bounce, which discards the config and reloads the page. Without persistence the key is lost and impersonation only
works on a second attempt.

The key is a bearer credential — stripping it keeps it out of the address bar, the history entry and outgoing `Referer` headers.
Call `clearImpersonationKey()` once the impersonated session is established, so it does not stay readable for the rest of its TTL.

## 9. Reference

- Endpoint: `https://user-frontend.api.preprod.pl-x.cloud/plx:pxc/oidc/v1.0/authorize`
- Flow: OIDC 1.0 Authorization Code Grant + PKCE (S256)
- Widget source: `node_modules/@mindtwo/px-user-widgets/src/widgets/px-user-login-oidc.js`
