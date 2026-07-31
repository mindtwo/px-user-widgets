<script setup lang="ts">
/**
 * The auth-facing elements the package registers, with the details that are easy
 * to get wrong: the success event name (four of them are not `success`) and
 * whether `data-token` is required.
 *
 * `px-user-eip-config` is deliberately absent — it is an admin surface for
 * entering Azure credentials, not part of an authentication flow.
 */
const widgets = [
    {
        element: 'px-user-oidc',
        to: '/',
        wrapper: 'PxOidcLogin',
        event: 'login',
        token: 'no',
        note: 'Lives on the index page, together with the Auth-as-a-Service flow.',
    },
    {
        element: 'px-user-login',
        to: '/login',
        wrapper: 'PxLogin',
        event: 'login',
        token: 'no',
        note: 'Classic username/password. Shows no success message of its own.',
    },
    {
        element: 'px-user-forgot-password',
        to: '/widgets/forgot-password',
        wrapper: 'PxForgotPassword',
        event: 'success',
        token: 'no',
        note: 'Renders its own confirmation message.',
    },
    {
        element: 'px-user-set-password',
        to: '/widgets/set-password',
        wrapper: 'PxSetPassword',
        event: 'success',
        token: 'required',
        note: 'Reset token from the mailed link.',
    },
    {
        element: 'px-user-set-password-by-forgot-password-code-and-login',
        to: '/widgets/set-password-by-code',
        wrapper: 'PxSetPasswordByCodeAndLogin',
        event: 'login',
        token: 'optional',
        note: 'The user types the code into the form; logs in on success.',
    },
    {
        element: 'px-user-activate-user',
        to: '/widgets/activate-user',
        wrapper: 'PxActivateUser',
        event: 'success',
        token: 'required',
        note: 'Throws an unhandled rejection when data-token is missing.',
    },
    {
        element: 'px-user-activate-user-and-login',
        to: '/widgets/activate-user-and-login',
        wrapper: 'PxActivateUserAndLogin',
        event: 'login',
        token: 'required',
        note: 'Activates and signs in, in one step.',
    },
    {
        element: 'px-user-activate-user-with-activation-code',
        to: '/widgets/activation-code',
        wrapper: 'PxActivationCode',
        event: 'activated',
        token: 'optional',
        note: 'Code validation writes to the message span without emitting.',
    },
    {
        element: 'px-user-confirm-email',
        to: '/widgets/confirm-email',
        wrapper: 'PxConfirmEmail',
        event: 'success',
        token: 'required',
        note: 'Headless — no form, acts on the token.',
    },
]
</script>

<template>
    <div class="stack">
        <div>
            <h1>Widgets</h1>
            <p class="lede">
                Every authentication element the package registers, one per page. Each page shows the
                attributes it bound and logs every event the widget fired.
            </p>
        </div>

        <div class="card">
            <table class="table">
                <thead>
                    <tr>
                        <th>Element</th>
                        <th>Wrapper</th>
                        <th>Success event</th>
                        <th><code>data-token</code></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="widget in widgets" :key="widget.element">
                        <td>
                            <NuxtLink :to="widget.to"><code>{{ widget.element }}</code></NuxtLink>
                            <br>
                            <span class="muted">{{ widget.note }}</span>
                        </td>
                        <td><code>{{ widget.wrapper }}</code></td>
                        <td>
                            <code v-if="widget.event !== 'none'" class="tag">{{ widget.event }}</code>
                            <span v-else class="muted">none</span>
                        </td>
                        <td>
                            <span :class="widget.token === 'required' ? 'warn' : 'muted'">
                                {{ widget.token }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="notice">
            <p>
                <strong>Labels are deliberately not overridden anywhere.</strong> Every widget
                runs with its own default copy, so what you see here is what the package ships.
            </p>
        </div>
    </div>
</template>
