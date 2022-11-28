# PX-User Widgets

Wrapper for reusing the px user widgets the same way on each client.

## Installation

You can install the package via npm:

```bash
npm i @mindtwo/px-user-widgets --save
```

## Usage

To fully use the widgets add the following snippets to your main view:

```html
    <!-- Load PX-User Widgets -->
    <script src="https://user-frontend.api.pl-x.cloud/js/widget.js"></script>
```

```php
<!-- Load PX-Mod-User Widget -->
<script>
    // include env vars for use in PX-User module
    window.PX_USER_DOMAIN = '{{ config('px-user.domain') }}';
    window.PX_USER_TENANT = '{{ config('px-user.tenant') }}';
    window.PX_USER_STAGE = '{{ config('px-user.stage') }}';
</script>
```

### Add a widget to the page

The package will register custom components for you. To use a component simply add teh following to your DOM

```html
<px-user-login data-containerId="login-modal" data-app-url="your app url" />
```

The value for container id should be a unique DOM-Element id on your page. The package provides the following elements:

```html
<px-user-activate-user />

<px-user-forgot-password />

<px-user-set-password />

<px-user-admin-login />
```

### Element Attributes

You can add the following attributes to a custom element:

- data-containerId: Unique id for the DOM Element
- data-app-url: The url of the app you wish to send requests to
- data-token (only for set-password and activate-user): Token used to authenticate the request

- stage (optional): The value for PX User Stage if set you can remove window.PX_USER_STAGE = ... from the snippet above
- tenant (optional): The value for PX User Tenant if set you can remove window.PX_USER_TENANT = ... from the snippet above
- domain (optional): The value for PX User Domain if set you can remove window.PX_USER_DOMAIN = ... from the snippet above

### Login a user

If the user is logged in successfully via `px-user-login` the element fires a global event with the name `px-user-loggedIn`.
Inside the `CustomEvent.detail` the dispatch stores the retrived token data from PX Users API.

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email info@mindtwo.de instead of using the issue tracker.

## Credits

- [mindtwo GmbH][link-author]
- [All Other Contributors][link-contributors]

## License
