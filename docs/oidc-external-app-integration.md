# Integrating an external app with PX-User as auth provider

You're building an app that lets people sign in with their PX-User account, using a mindtwo-hosted login UI as the identity
provider. This is the **client** (relying party) side of the flow — the counterpart to
[`oidc-integration.md`](./oidc-integration.md), which covers hosting the login UI itself.

## 1. Which side are you on?

| You are… | You need |
|---|---|
| Hosting the login form — users type their password on **your** domain | [`oidc-integration.md`](./oidc-integration.md) — mount the `<px-user-oidc>` widget |
| Sending users **away** to sign in and getting them back with a code | **this document** |

If you're on this side: you do **not** mount the widget and you do **not** need `@mindtwo/px-user-widgets` as a runtime
dependency. You are a standard OIDC Authorization Code + PKCE client, and any conformant OIDC library will do. The package's
`@mindtwo/px-user-widgets/oidc` subpath offers a few small browser helpers you may find convenient (§5) — that's the extent of it.

> **No `client_secret` is involved.** The token endpoint authenticates the exchange with the PKCE verifier alone — you are a
> *public* client. A browser-only SPA can technically complete this flow (§5), but §4 is still what we recommend: keeping the
> verifier out of the browser is the difference between a stolen `code` being useless and being enough.

## 2. What you need from us before you start

Ask your mindtwo contact for:

| Item | Notes |
|---|---|
| `client_id` | e.g. `prod-replit-den`. If you are handed m2m credentials as `clientId:secret`, only the id is used in this flow |
| **Authorization URL** | Where you send the user. May be our hosted login UI (`https://<login-host>/`) rather than the raw `/authorize` endpoint — treat it as an opaque base URL and append the standard parameters |
| **Discovery URL** | `{context}/oidc/v1.0/.well-known/openid-configuration` — resolve the token/userinfo/JWKS endpoints from here instead of hardcoding them |
| `{context}` prefix | Tenant path segment, e.g. `plx:pxc` |
| Stage hosts | `preprod` vs `prod` differ — confirm both |
| Allowed scopes | e.g. `openid profile email roles permissions` |

And give us:

| Item | Notes |
|---|---|
| Your `redirect_uri`(s) | **Exact match**, one per environment. Use a clean path with no query string, e.g. `https://your-app.example/auth/callback` |
| Post-logout URL | If you need one |

An unregistered `redirect_uri` fails **before** the login form renders, with a client validation error — so register every
environment up front, including local development.

## 3. The flow

```
your app                      login UI (mindtwo)            PX-User
   │                                 │                          │
   │ 1. build PKCE + state,          │                          │
   │    store verifier server-side   │                          │
   │────── redirect user ───────────>│                          │
   │        ?response_type=code      │ 2. user signs in         │
   │        &client_id=…             │    (password, or Entra   │
   │        &redirect_uri=…          │     ID — invisible to    │
   │        &code_challenge=…        │     you)                 │
   │        &state=…                 │                          │
   │                                 │──── authorize ──────────>│
   │<───── redirect back ────────────────────────────────────────┤
   │        /auth/callback?code=…&state=…                        │
   │                                                             │
   │ 3. validate state                                           │
   │ 4. POST code + code_verifier + client_id ──────────────────>│
   │<───── access_token, refresh_token, id_token ────────────────┤
```

Step 2 may involve a redirect to Microsoft Entra ID and back. That is entirely internal to the login UI — you will not see it, and
you must not assume the user comes back on the next HTTP request. Only your `redirect_uri` being called means anything.

## 4. Recommended: server-side

Keep the verifier and the `state` in your server-side session. Nothing sensitive touches the browser.

### 4.1 Start the login

```js
import { createHash, randomBytes } from 'node:crypto';

const base64url = (buf) => buf.toString('base64url');

export function buildAuthorizationUrl(session) {
    const verifier = base64url(randomBytes(32));
    const state = base64url(randomBytes(16));

    // Bind both to this browser session — never to a global or a cache key
    // an attacker could guess.
    session.oidc = { verifier, state, createdAt: Date.now() };

    const url = new URL(process.env.PX_AUTHORIZATION_URL);

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.PX_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.PX_REDIRECT_URI);
    url.searchParams.set('scope', 'openid profile email');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', base64url(createHash('sha256').update(verifier).digest()));
    url.searchParams.set('code_challenge_method', 'S256');

    return url.toString();
}
```

`code_challenge_method` must be `S256`; `plain` is not supported. `scope` must include `openid`.

### 4.2 Handle the callback

```js
export async function handleCallback(query, session) {
    if (query.error) {
        // login_required, interaction_required, account_selection_required, …
        throw new Error(`${query.error}: ${query.error_description ?? ''}`);
    }

    const pending = session.oidc;
    delete session.oidc; // single use — a replayed callback must not succeed

    if (!pending || !query.state || query.state !== pending.state) {
        throw new Error('OIDC state mismatch — possible CSRF, abort');
    }

    // The authorization code has a 5 second TTL. Exchange it immediately:
    // no queues, no retries with backoff, no user interaction in between.
    const res = await fetch(process.env.PX_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: query.code,
            code_verifier: pending.verifier,
            client_id: process.env.PX_CLIENT_ID,
            redirect_uri: process.env.PX_REDIRECT_URI,
        }),
    });

    if (!res.ok) {
        throw new Error(`token exchange failed: ${res.status}`);
    }

    return res.json(); // { access_token, refresh_token, token_type, expires_in, … }
}
```

### 4.3 What we append to your `redirect_uri`

On success:

| Parameter | Meaning |
|---|---|
| `code` | The authorization code. **5 second TTL** |
| `state` | Your value, echoed back unchanged |
| `codeType` | `auth_code` |
| `tenant`, `domain` | Context identifiers |

On failure: `error` and `error_description`. Ignore any parameter you don't recognise rather than rejecting the callback — more may
be added.

## 5. Alternative: PKCE generated in the browser

If your architecture generates the challenge client-side and posts the code to your own backend for the exchange (the pattern
`app-teach-frontend` uses), the package's helpers save you writing the crypto:

```js
// Subpath import — helpers only, no custom element side effects.
import { generatePkce, storePkce, readPkce } from '@mindtwo/px-user-widgets/oidc';

// Before redirecting:
const pkce = await generatePkce();       // { verifier, state, challenge }
storePkce(pkce);                          // sessionStorage: verifier + state + challenge

// On your callback page:
const { verifier, state } = readPkce();   // reads and clears
if (!state || state !== new URLSearchParams(location.search).get('state')) {
    throw new Error('OIDC state mismatch — possible CSRF, abort');
}
// POST { code, code_verifier: verifier } to your own backend, which calls the
// token endpoint. This is what app-teach does — see
// Domain\User\Services\OidcTokenExchangeService.
```

Also exported: `challengeFromVerifier()`, `base64UrlEncode()`, `clearPkce()`, and configurable storage keys — see
[`oidc-integration.md`](./oidc-integration.md) §7.

Trade-offs against §4:

- `sessionStorage` is **per tab**. If your callback lands in a different tab or a fresh window, the verifier is gone and login
  fails. The server-side session in §4 has no such limitation.
- Anything in `sessionStorage` is reachable by any script on your origin. An XSS bug means a stolen verifier.
- You can call the token endpoint straight from the browser — no secret stands in the way — but then the tokens land in the
  browser too. Once you route the exchange through your own backend anyway, §4 is the same amount of work with the verifier in
  a place XSS cannot reach.

Prefer §4 unless you have a concrete reason not to.

## 6. Endpoints

Resolve these from the discovery document rather than hardcoding them:

```
GET {context}/oidc/v1.0/.well-known/openid-configuration
```

| Purpose | Path |
|---|---|
| Authorize | `{context}/oidc/v1.0/authorize` — but use the authorization URL we give you, which may be our hosted login UI |
| Token | `{context}/oidc/v1.0/token/{token_format}` |
| UserInfo | `{context}/oidc/v1.0/userinfo` (GET, `Authorization: Bearer …`) |
| JWKS | `{context}/oidc/v1.0/.well-known/jwks.json` |

Host per stage: `https://user-frontend.api.preprod.pl-x.cloud` / `https://user-frontend.api.pl-x.cloud`. `{context}` is your tenant
prefix, e.g. `plx:pxc`.

> Confirm the `{token_format}` segment and the exact token URL with us or via discovery before you build against it — it varies by
> tenant configuration and we do not want you hardcoding a guess.

## 7. Gotchas

- **`state` is yours and we echo it unchanged.** Validate it on every callback. It's your only CSRF protection on this leg.
- **`nonce` is currently not forwarded** by the hosted login UI. Don't rely on it for `id_token` replay protection yet — ask us
  before designing around it.
- **Validate the `id_token` server-side** against the JWKS endpoint. Never trust an unverified token, and never parse it in the
  browser to make authorization decisions.
- **The code expires in 5 seconds.** Exchange it in the same request handler that receives the callback.
- **`redirect_uri` must match exactly** — scheme, host, port, path. Send it identically on both the authorize *and* the token
  request. Keep it free of query parameters.
- **`prompt=none`** returns `error=login_required` or `error=account_selection_required` rather than showing a form. If you use it,
  handle those.
- **Don't cache or reuse a verifier.** One login attempt, one verifier, one code.
- **The user's actual login method is invisible to you.** Password, Entra ID, MFA challenges — all handled inside the login UI.
  Don't build UI that assumes one of them.

## 8. Before you go live

- [ ] `redirect_uri` registered for every environment, local included
- [ ] The PKCE verifier never reaches the browser (§4), or the trade-off in §5 was a deliberate decision
- [ ] `state` validated, and rejection actually fails the login
- [ ] Replaying an old callback URL fails
- [ ] Mismatched/absent verifier fails
- [ ] `id_token` signature verified against JWKS
- [ ] Error redirects (`error=login_required`, `access_denied`) render something sensible
- [ ] Token refresh works, and expiry is handled without dropping the user on a blank page
- [ ] Tested against `preprod` before `prod`

## 9. Reference

- Hosting the login UI instead: [`oidc-integration.md`](./oidc-integration.md)
- Flow internals, and why the login UI behaves the way it does:
  [`../OIDC-FLOW-INVESTIGATION.md`](../OIDC-FLOW-INVESTIGATION.md)
- Spec: OIDC 1.0 Authorization Code Grant, PKCE per RFC 7636 (S256)
