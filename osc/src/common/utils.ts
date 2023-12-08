/**
 * Check if given object is an integer number
 */
export function isInt(n: any): n is number {
  return Number(n) === n && n % 1 === 0
}

/**
 * Check if given object is a float number
 */
export function isFloat(n: any): n is number {
  return Number(n) === n && n % 1 !== 0
}

/**
 * Check if given object is a number
 */
export function isNumber(n: any): n is number {
  return Number(n) === n
}

/**
 * Check if given object is a string
 */
export function isString(n: any): n is string {
  return typeof n === 'string'
}

/**
 * Check if given object is a boolean
 */
export function isBoolean(n: any): n is boolean {
  return typeof n === 'boolean'
}

/**
 * Check if given object is infinity constant
 */
export function isInfinity(n: any): n is typeof Infinity {
  return n === Infinity
}

/**
 * Check if given object is an array
 */
export function isArray(n: any): n is any[] {
  return Array.isArray(n)
}

/**
 * Check if given object is a Uint8Array
 */
export function isBlob(n: any): n is Uint8Array {
  return n instanceof Uint8Array
}

/**
 * Check if given object is a Date
 */
export function isDate(n: any): n is Date {
  return n instanceof Date
}

/**
 * Check if given object is undefined
 */
export function isUndefined(n: any): n is undefined {
  return typeof n === 'undefined'
}

/**
 * Check if given object is null
 */
export function isNull(n: any): n is null {
  return n === null
}

/**
 * Return the next multiple of four
 */
export function pad(n: number) {
  return (n + 3) & ~0x03
}