import { useBridge } from '@/bridge'
import type { LogType } from '@/types/Log'
import type { OscNotifyMessages, OscRequestMessages } from '@/types/OscMessages'
import { luaToJson } from '@/utils'
import { useEventBus } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { useItems } from './items'
import { useLogs } from './logs'
import { useProject } from './project'
import { useMidi } from './midi'

export const useDevice = defineStore('device', () => {
  const isConnected = ref(false)
  const midiDevices = [
    { id: 1, label: 'PC', hasCables: true },
    { id: 2, label: 'DIN 1' },
    { id: 3, label: 'DIN 2' },
    // Todo: handle USB port's midi devices 5-13
    { id: 4, label: 'USB' },
  ]
  const memoryUsageThresholds = [
    { value: 300, type: 'high' },
    { value: 250, type: 'increased' },
  ] as const
  const memoryUsage = ref<'normal' | 'increased' | 'high'>('normal')

  const bridge = useBridge()
  const project = useProject()
  const items = useItems()
  const log = useLogs()
  const midi = useMidi()
  const deviceMemoryBus = useEventBus<number>('device-memory')

  bridge.on('/open', async () => {
    isConnected.value = true
    window.postMessage({ method: 'deviceConnected' })
    await items.updateDefinitions()
    await midi.updateInfo()
    project.load()
  })
  bridge.on('/close', () => (isConnected.value = false))

  bridge.on('/log/:type', ({ args: [text] }, { type }) => {
    const value = type === 'dump' ? luaToJson(text) : text
    if (!['info', 'warn', 'error', 'dump'].includes(type)) {
      console.warn(`unknown log typ '${type}'`)
      return
    }
    log.log(type as LogType, value)
  })

  bridge.on('/data/unknown', (data) => {
    log.log('info', new TextDecoder().decode(data))
  })

  bridge.on('/n/info/memory', ({ args: [memory] }) => {
    deviceMemoryBus.emit(memory)
    memoryUsage.value =
      memoryUsageThresholds.find((threshold) => memory >= threshold.value)
        ?.type ?? 'normal'
  })

  const open = () => {
    bridge.open({ baudRate: 9600, usbVendorId: 5824, usbProductId: 1161 })
  }

  const close = () => {
    bridge.close()
  }

  const restart = () => {
    bridge.request('/lua/restart', [])
  }

  const update = <A extends keyof OscRequestMessages>(
    address: A,
    args?: Parameters<OscRequestMessages[A]>,
  ) => {
    if (!isConnected.value) return
    // The device's storage is our source of truth for the project. Therefore
    // with each update we also save the whole project.
    project.save()
    // TODO: remove `any`, use `MessageArg` as soon as bridge exports it, or
    // make args optional in bridge itself.
    return bridge.request(address, args ?? ([] as any[])) as Promise<
      ReturnType<OscRequestMessages[A]>
    >
  }

  const request = <A extends keyof OscRequestMessages>(
    address: A,
    args?: Parameters<OscRequestMessages[A]>,
  ) => {
    if (!isConnected.value) return
    // TODO: remove `any`, use `MessageArg` as soon as bridge exports it, or
    // make args optional in bridge itself.
    return bridge.request(address, args ?? ([] as any)) as Promise<
      ReturnType<OscRequestMessages[A]>
    >
  }

  const notify = <A extends keyof OscNotifyMessages>(
    address: A,
    args?: Parameters<OscNotifyMessages[A]>,
  ) => {
    if (!isConnected.value) return
    return bridge.notify(address, args ?? [])
  }

  // Init
  open()

  return {
    midiDevices,
    isConnected,
    memoryUsage,
    open,
    close,
    restart,
    update,
    request,
    notify,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDevice as any, import.meta.hot))
