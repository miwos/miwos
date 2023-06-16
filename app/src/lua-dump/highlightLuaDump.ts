import { tokenizeKey, tokenizeValue } from './tokenize'
import type { Formatter } from './types'
import { asArray, indent } from './utils'

const highlightTable = (
  obj: Record<any, any>,
  depth: number,
  format: Formatter
): string => {
  const keys = Object.keys(obj)
  if (!keys.length) return '{}'

  let str = '{\n'
  let index = 0
  for (const key of keys.sort()) {
    const value = obj[key]
    const highlightedKey = format(...tokenizeKey(key))
    const highlightedValue =
      typeof value === 'object'
        ? highlightTable(value, depth + 1, format)
        : highlightValue(value, format)

    str += indent(depth + 1) + `${highlightedKey} = ${highlightedValue}`
    str += index < keys.length ? ',\n' : '\n'
    index++
  }
  return str + indent(depth) + '}'
}

const highlightValue = (value: string, format: Formatter) =>
  format(...tokenizeValue(value))

/**
 * Highlight and format the dump object from lua for printing it to the console.
 */
export const highlightLuaDump = (dump: any, format: Formatter) =>
  asArray(dump)
    .map((v) =>
      typeof v === 'object'
        ? highlightTable(v, 0, format)
        : highlightValue(v, format)
    )
    .join('\n')
