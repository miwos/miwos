import { useBridge } from '@/bridge'
import type { LogType } from '@/types/Log'
import type { OscNotifyMessages, OscRequestMessages } from '@/types/OscMessages'
import { luaToJson } from '@/utils'
import { useEventBus } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { useLog } from './log'
import { useModuleDefinitions } from './moduleDefinitions'
import { useProject } from './project'
import { useTransport } from './transport'

export const useDevice = defineStore('device', () => {
  const isConnected = ref(false)
  const midiDevices = [
    { id: 1, label: 'PC', hasCables: true },
    { id: 2, label: 'DIN 1' },
    { id: 3, label: 'DIN 2' },
    // Todo: handle USB port's midi devices 5-13
    { id: 4, label: 'USB' },
  ]

  const bridge = useBridge()
  const project = useProject()
  const moduleDefinitions = useModuleDefinitions()
  const transport = useTransport()
  const log = useLog()
  const deviceMemoryBus = useEventBus<number>('device-memory')

  bridge.on('/close', () => (isConnected.value = false))

  bridge.on('/log/:type', ({ args: [text] }, { type }) => {
    if (['info', 'warn', 'error'].includes(type)) {
      log.log(type as LogType, text)
    } else if (type === 'dump') {
      log.dump(luaToJson(text))
    } else if (type === 'stack') {
      // log.stack(text)
    }
  })

  bridge.on('/data/unknown', (data) => {
    log.log('info', new TextDecoder().decode(data))
  })

  bridge.on('/n/info/memory', ({ args: [memory] }) =>
    deviceMemoryBus.emit(memory)
  )

  const open = async () => {
    await bridge.open({ baudRate: 9600 })
    isConnected.value = true
    await moduleDefinitions.loadAllFromDevice()
    await transport.loadFromDevice()
    window.postMessage({ method: 'deviceConnected' })
    project.load()
  }

  const close = async () => {
    await bridge.close()
    isConnected.value = false
  }

  const update = <A extends keyof OscRequestMessages>(
    address: A,
    args?: Parameters<OscRequestMessages[A]>
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
    args?: Parameters<OscRequestMessages[A]>
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
    args?: Parameters<OscNotifyMessages[A]>
  ) => {
    if (!isConnected.value) return
    return bridge.notify(address, args ?? [])
  }

  return { midiDevices, isConnected, open, close, update, request, notify }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDevice as any, import.meta.hot))
