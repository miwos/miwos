import type { LogEntry, LogType } from '@/types/Log'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useLogs = defineStore('logs', () => {
  const entries = ref<LogEntry[]>([])

  const errorCount = ref(0)
  const warnCount = ref(0)

  const log = <
    T extends LogType,
    V = T extends 'dump' ? Record<string, any> : string,
  >(
    type: T,
    value: V,
  ) => {
    if (type === 'dump') {
      entries.value.push({
        type,
        value: value as Record<string, any>,
        count: 1,
      })
      return
    }

    const lastEntry = entries.value.at(-1)
    if (lastEntry && lastEntry.type === type && lastEntry.value === value) {
      lastEntry.count += 1
    } else if (type) {
      entries.value.push({ type, value: value as string, count: 1 })
    }

    if (type === 'error') errorCount.value += 1
    else if (type === 'warn') warnCount.value += 1
  }

  const info = (text: string) => log('info', text)
  const warn = (text: string) => log('warn', text)
  const error = (text: string) => log('error', text)
  const dump = (value: Record<string, any>) => log('dump', value)
  const clear = () => {
    entries.value = []
    errorCount.value = 0
    warnCount.value = 0
  }

  return { entries, errorCount, warnCount, log, info, warn, error, dump, clear }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLogs as any, import.meta.hot))
