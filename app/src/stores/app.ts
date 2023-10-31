import { useBridge } from '@/bridge'
import { useDevice } from '@/stores/device'
import { useLog } from '@/stores/log'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { useItems } from './items'

export const useApp = defineStore('app', () => {
  const showPropFields = ref(false)
  const isMapping = ref(false)
  const isOverlaying = ref(false)

  const bridge = useBridge()
  const device = useDevice()
  const log = useLog()
  const items = useItems()

  window.addEventListener('message', async ({ data }) => {
    if (!data.method) return

    if (!device.isConnected) {
      console.warn('Device is not connected.')
      return
    }

    if (data.method === 'updateFile') {
      const { path, content } = data.params
      await bridge.writeFile(`lua/${path}`, content)
      const isHotReplaced = await bridge.request('/lua/update', `lua/${path}`)

      const type = isHotReplaced ? 'hmr update' : 'reload'
      log.info(`{success ${type}} {gray ${path}}`)

      const match = path.match(/^items\/(.*)\.lua$/)
      if (match) {
        const [, name] = match
        items.updateDefinition(name)
      }
      return
    }

    if (data.method === 'writeFile') {
      const { path, content } = data.params
      await bridge.writeFile(`lua/${path}`, content)
      return
    }
  })

  return { showPropFields, isMapping, isOverlaying }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApp as any, import.meta.hot))
