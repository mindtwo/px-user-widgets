// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    modules: ['nuxt-auth-utils'],

    css: ['~/assets/css/main.css'],

    $development: {
        devServer: {
            https: true,
        },
    },

    // The package registers its <px-user-*> elements at runtime via
    // customElements.define(), so the Vue compiler must not treat them as
    // unresolved components.
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('px-user-'),
        },
    },

    runtimeConfig: {
        session: {
            name: 'px-playground-session',
            password: '', // NUXT_SESSION_PASSWORD — min. 32 characters
        },

        // Server-only. None of this is ever serialised into the client payload.
        pxUser: {
            // No client secret: the token endpoint authenticates with PKCE
            // alone. Nothing in either flow sends one.
            context: '', // NUXT_PX_USER_CONTEXT — tenant path segment, e.g. plx:pxc
            authorizationUrl: '', // NUXT_PX_USER_AUTHORIZATION_URL — hosted login host (service mode)
            // Discovery, token and userinfo live on the API host, not on
            // user-frontend — that one only serves the authorize UI and answers
            // 500 for every path under it, including /.well-known/.
            oidcHost: 'https://user.api.preprod.pl-x.cloud',
            apiHost: 'https://user.api.preprod.pl-x.cloud',
        },

        public: {
            appUrl: 'http://localhost:3000',

            // Lets the index page disable "Auth as a Service" with a hint rather
            // than let you click through to a 400. Only the boolean crosses over;
            // the authorization URL itself stays server-side.
            //
            // Read from process.env here rather than mirrored at runtime, because
            // Nitro's runtime config is frozen — a Nitro plugin cannot assign to
            // it. So this is fixed when the dev server or build starts: restart
            // after changing the env var. /api/auth/authorize re-checks on every
            // request and is the actual enforcement.
            serviceModeAvailable: Boolean(
                process.env.NUXT_PX_USER_AUTHORIZATION_URL,
            ),

            pxUser: {
                stage: 'preprod',
                tenant: '',
                domain: '',
                clientId: '',
                scope: 'openid profile email',
                language: 'de',
                // The widget resolves this against `data-app-url`, i.e.
                // `${appUrl}/css/px-user.css` → playground/public/css/px-user.css
                cssPath: 'css/px-user.css',
                showEipLogin: true,
            },
        },
    },
});
