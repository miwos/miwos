import type { TokenType } from './types'

export const tokenizeKey = (key: string): [value: any, token: TokenType] => {
  if (/^(_G|_VERSION)$/.test(key)) {
    // Special global lua key
    return [key, 'specialKey']
  } else if (/^\#(table|(light)?function)\#$/.test(key)) {
    // Complex data type representation
    return [`[${key.slice(1, -1)}]`, 'complexType']
  } else if (/^\[\d+\]$/.test(key)) {
    // Number
    return [`[${key}]`, 'number']
  } else if (/^(true|false)$/.test(key)) {
    // Boolean
    return [`[${key}]`, 'boolean']
  } else {
    // String
    return [key, 'key']
  }
}

export const tokenizeValue = (
  value: string
): [value: any, token: TokenType] => {
  if (/^\#(table|(light)?function)\#$/.test(value)) {
    // Complex data type representation
    return [value.slice(1, -1), 'complexType']
  } else if (value === '#nil#') {
    // Special key
    return [value.slice(1, -1), 'specialKey']
  } else if (typeof value === 'number') {
    // Number
    return [value, 'number']
  } else if (typeof value === 'boolean') {
    // Boolean
    return [value, 'boolean']
  } else {
    // String
    return [`'${value}'`, 'string']
  }
}
