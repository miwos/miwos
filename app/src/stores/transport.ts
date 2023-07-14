import { ref } from 'vue'
import { useDevice } from './device'
import { useBridge } from '@/bridge'
import { acceptHMRUpdate } from 'pinia'
import { luaToJson } from '@/utils'

export const useTransport = () => {
  const tempo = ref(120)
  const metronomeSide = ref<'left' | 'right'>('left')
  const isPlaying = ref(false)

  const device = useDevice()
  const bridge = useBridge()

  bridge.on('/n/transport/quarter', ({ args: [isLeftSide] }) => {
    metronomeSide.value = isLeftSide ? 'left' : 'right'
  })

  bridge.on('/n/transport/tempo', (bpm: number) => (tempo.value = bpm))
  bridge.on('/n/transport/play', () => (isPlaying.value = true))
  bridge.on('/n/transport/stop', () => (isPlaying.value = false))

  // Actions
  const start = async () => {
    await device.request('/r/transport/start')
    isPlaying.value = true
  }

  const stop = async () => {
    await device.request('/r/transport/stop')
    isPlaying.value = false
  }

  const setTempo = (bpm: number) => device.request('/r/transport/tempo', [bpm])

  const loadFromDevice = async () => {
    const lua = await device.request('/r/transport/info')
    if (!lua) return
    const info = luaToJson<{ tempo: number; isPlaying: boolean }>(lua)
    tempo.value = info.tempo
    isPlaying.value = info.isPlaying
  }

  return { metronomeSide, isPlaying, start, stop, setTempo, loadFromDevice }
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTransport as any, import.meta.hot))
