import { ref } from 'vue'
import { useDevice } from './device'
import { useBridge } from '@/bridge'
import { acceptHMRUpdate } from 'pinia'
import { luaToJson } from '@/utils'

export const useMidi = () => {
  const tempo = ref(120)
  const metronomeSide = ref<'left' | 'right'>('left')
  const isPlaying = ref(false)

  const device = useDevice()
  const bridge = useBridge()

  bridge.on('/n/midi/quarter', ({ args: [isLeftSide] }) => {
    metronomeSide.value = isLeftSide ? 'left' : 'right'
  })

  bridge.on('/n/midi/tempo', (bpm: number) => (tempo.value = bpm))
  bridge.on('/n/midi/play', () => (isPlaying.value = true))
  bridge.on('/n/midi/stop', () => (isPlaying.value = false))

  // Actions
  const start = async () => {
    await device.request('/r/midi/start')
    isPlaying.value = true
  }

  const stop = async () => {
    await device.request('/r/midi/stop')
    isPlaying.value = false
  }

  const setTempo = (bpm: number) => device.request('/r/midi/tempo', [bpm])

  const updateInfo = async () => {
    const lua = await device.request('/r/midi/info')
    if (!lua) return
    const info = luaToJson<{ tempo: number; isPlaying: boolean }>(lua)
    tempo.value = info.tempo
    isPlaying.value = info.isPlaying
  }

  return { metronomeSide, isPlaying, start, stop, setTempo, updateInfo }
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMidi as any, import.meta.hot))
