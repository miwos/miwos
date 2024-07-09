import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

const moveIdToDataName = {
  name: 'moveIdToDataName',
  type: 'perItem',
  active: true,
  description: 'Moves id attributes to data-name attributes',
  fn: () => ({
    element: {
      enter({ attributes }: any) {
        if (attributes.id) attributes['data-name'] = attributes.id
      },
    },
  }),
}

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      svgoConfig: {
        plugins: [
          moveIdToDataName,
          {
            name: 'preset-default',
            params: { overrides: { removeViewBox: false } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
