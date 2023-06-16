import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
// @ts-ignore (missing types)
import raw from 'vite-plugin-raw'

export default defineConfig({
  plugins: [vue(), raw({ match: /\.svg$/ })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
