import type { Formatter } from './types'
import { tokenizeValue } from './tokenize'
import { center, fit } from './utils'

const columnWidth = 16
const margin = 8

const line = (position: 'top' | 'bottom' | 'join') => {
  const [left, right] = { top: '┌┐', bottom: '└┘', join: '├┤' }[position]
  return ' '.repeat(margin) + left + '─'.repeat(columnWidth) + right + '\n'
}

export const highlightLuaStack = (stack: any[], format: Formatter) => {
  const { length } = stack
  const rows: string[] = []

  for (let i = length; i > 0; i--) {
    const [value, token] = tokenizeValue(stack[i - 1])
    const highlighted = format(fit(`${value}`, columnWidth), token)
    const positiveIndex = `${i}  `.padStart(margin)
    const negativeIndex = ` -${length - i + 1}`

    rows.push(`${positiveIndex}│${highlighted}│${negativeIndex}\n`)
  }

  if (!rows.length)
    rows.push(`${' '.repeat(margin)}│${center('EMPTY', columnWidth)}│\n`)

  return line('top') + rows.join(line('join')) + line('bottom')
}
