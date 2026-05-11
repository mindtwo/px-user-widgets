// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        minify: false,
        lib: {
            entry: {
                'px-user-widgets': resolve(__dirname, 'src/main.js'),
                oidc: resolve(__dirname, 'src/oidc.js'),
            },
            name: 'PxUserWidgets',
            formats: ['es', 'cjs'],
        },
    },
});
