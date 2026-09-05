import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],

    build: {
        copyPublicDir: false,

        lib: {
            entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
            name: 'VueSmartTreeSelect',
            formats: ['es', 'umd'],
            fileName: (format) => `vue-smart-tree-select.${format}.js`,
            cssFileName: 'style',
        },

        rollupOptions: {
            external: ['vue'],

            output: {
                exports: 'default',
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})