// vite.config.js
import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './src/index.js'),
            name: 'TailwindcssClassParser',
            fileName: 'tailwindcss-class-parser',
        },
        rollupOptions: {
            external: (id) => /^tailwindcss($|\/)/.test(id),
            output: {
                globals: {
                    "tailwindcss": 'tailwindcss',
                },
            },
        },
    }
})