// import { createColorize } from '@/utils'
import { highlightLuaDump } from '@/lua-dump'
import type { LogEntry, LogType } from '@/types/Log'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export type Colors = Record<string, (input: string) => string>

const createColorize = (colors: Colors = {}) => {
  let MARKS = Object.keys(colors).toString().replace(/,/g, '|')
  let RE_BLOCK = new RegExp(
    `\\{((?:${MARKS})(?:\\.(?:${MARKS}))*?)\\s|(\\})|(.[^{}]*)`,
    'gi'
  )

  return (strings: TemplateStringsArray, ...args: any) => {
    const input = strings.reduce((a, s, i) => (a += args[--i] + s))
    let stack: { marks: string[]; raw: string }[] = [{ marks: [], raw: '' }]

    input.replace(RE_BLOCK, (block, open, close, other = '', pos) => {
      if (open) {
        other = block
        if (input.indexOf('}', pos) + 1) {
          stack.push({ marks: open.split('.').reverse(), raw: '' })
          return ''
        }
      }

      if (close) {
        other = block
        if (stack.length !== 1) {
          let { marks, raw } = stack.pop()!
          other = marks.reduce((acc, mark) => colors[mark](acc), raw)
        }
      }

      stack[stack.length - 1].raw += other
      return ''
    })

    return stack[0].raw
  }
}

// prettier-ignore
const marks = [
  'black', 'white', 'gray', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan',
  'success', 'info', 'warn', 'error', 'specialKey', 'key', 'complexType',
  'number', 'boolean', 'string'
]
const createMark = (name: string, input: string) =>
  `<span class="mark-${name}">${input}</span>`
const colors = Object.fromEntries(
  marks.map((name) => [name, (input: string) => createMark(name, input)])
)

const colorize = createColorize(colors)

export const useLog = defineStore('logs', () => {
  const entries = ref<LogEntry[]>([])

  const log = (type: LogType, text: string) => {
    text = colorize`${text}`

    const lastEntry = entries.value[entries.value.length - 1]
    if (lastEntry && lastEntry.type === type && lastEntry.text === text) {
      lastEntry.count += 1
    } else {
      entries.value.push({ type, text, count: 1 })
    }
  }

  const info = (text: string) => log('info', text)

  const warn = (text: string) => log('warn', text)

  const error = (text: string) => log('error', text)

  const clear = () => (entries.value = [])

  const dump = (dump: any) => {
    const highlighted = highlightLuaDump(
      dump,
      (value, type) => colors[type]?.(value) ?? ''
    )
    entries.value.push({ type: 'dump', text: highlighted, count: 1 })
  }

  return { entries, log, info, warn, error, dump, clear }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLog as any, import.meta.hot))
