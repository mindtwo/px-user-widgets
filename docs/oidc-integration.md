# px-user OIDC widget — integration brief

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
| `data-redirect-uri` | `${window.location.origin}/callback` | Where the IdP redirects after auth |
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
| `data-verifier-storage-key` | `px-oidc-verifier` | sessionStorage key for the PKCE verifier |
| `data-state-storage-key` | `px-oidc-state` | sessionStorage key for the state value |

Container env attrs (any widget): `data-app-url`, `stage`, `tenant`, `domain` — or set the matching `window.PX_USER_*` globals once.

> ⚠️ Common pitfall: if you template values into the attributes (`data-client-id="{{ clientId }}"`), make sure the variable is actually defined. Otherwise the attribute renders as the literal string `undefined` and the IdP returns `invalid_client: Client ID "undefined" not found`.

## 3. PKCE + state handling

By default the widget auto-generates a PKCE verifier/challenge pair and a random `state`, then stores `verifier` and `state` in `sessionStorage` (keys `px-oidc-verifier`, `px-oidc-state`). You don't need to do anything before mounting.

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

## 7. Reference

- Endpoint: `https://user-frontend.api.preprod.pl-x.cloud/plx:pxc/oidc/v1.0/authorize`
- Flow: OIDC 1.0 Authorization Code Grant + PKCE (S256)
- Widget source: `node_modules/@mindtwo/px-user-widgets/src/widgets/px-user-login-oidc.js`
