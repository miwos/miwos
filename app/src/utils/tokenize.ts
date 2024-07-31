export type TokenType =
  | 'specialKey'
  | 'key'
  | 'complexType'
  | 'number'
  | 'boolean'
  | 'string'

export const tokenizeKey = (key: string): [value: any, token: TokenType] => {
  if (/^(_G|_VERSION)$/.test(key)) {
    // Special global lua key
    return [key, 'specialKey']
  } else if (/^\#(table|(light)?function)\#$/.test(key)) {
    // Complex data type representation
    return [`${key.slice(1, -1)}`, 'complexType']
  } else if (!isNaN(key as any)) {
    // Number
    // Note: because js object keys can only be strings, we loose the number
    // information from lua and do a quick-and-dirty check for a number string.
    return [key, 'number']
  } else if (/^(true|false)$/.test(key)) {
    // Boolean
    return [key, 'boolean']
  } else {
    // String
    return [key, 'key']
  }
}

export const tokenizeValue = (
  value: string,
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
