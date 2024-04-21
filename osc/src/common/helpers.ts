import Atomic from '../atomic'
import {
  isArray,
  isBlob,
  isBoolean,
  isFloat,
  isInfinity,
  isInt,
  isNull,
  isString,
} from './utils'

/**
 * Checks type of given object and returns the regarding OSC
 * Type tag character
 * @param item Any object
 * @return OSC Type tag character
 */
export function typeTag(item: any): string {
  if (isInt(item)) {
    return 'i'
  } else if (isFloat(item)) {
    return 'f'
  } else if (isString(item)) {
    return 's'
  } else if (isBlob(item)) {
    return 'b'
  } else if (isBoolean(item)) {
    return item ? 'T' : 'F'
  } else if (isNull(item)) {
    return 'N'
  } else if (isInfinity(item)) {
    return 'I'
  }

  throw new Error('OSC typeTag() found unknown value type')
}

/**
 * Sanitizes an OSC-ready Address Pattern
 * @param obj Address as string or array of strings
 * @return Corrected address string
 *
 * @example
 * // all calls return '/test/path' string:
 * prepareAddress('test/path')
 * prepareAddress('/test/path/')
 * prepareAddress([test, path])
 */
export function prepareAddress(obj: string[] | string): string {
  let address = ''

  if (isArray(obj)) {
    return `/${obj.join('/')}`
  } else if (isString(obj)) {
    address = obj

    // remove slash at ending of address
    if (address.length > 1 && address[address.length - 1] === '/') {
      address = address.slice(0, address.length - 1)
    }

    // add slash at beginning of address
    if (address.length > 1 && address[0] !== '/') {
      address = `/${address}`
    }

    return address
  }

  throw new Error(
    'OSC prepareAddress() needs addresses of type array or string',
  )
}

/**
 * Holds a list of items and helps to merge them
 * into a single array of packed binary data
 */
export default class EncodeHelper {
  data: Uint8Array[] = []
  byteLength = 0

  /**
   * Packs an item and adds it to the list
   * @param item Any object
   */
  add(item: boolean | number | null | Atomic): EncodeHelper {
    // Skip encoding items which do not need a payload as they are constants
    if (isBoolean(item) || isInfinity(item) || isNull(item)) {
      return this
    }

    const buffer = item.pack()
    this.byteLength += buffer.byteLength
    this.data.push(buffer)

    return this
  }

  /**
   * Merge all added items into one Uint8Array
   * @return Merged binary data array of all items
   */
  merge(): Uint8Array {
    const result = new Uint8Array(this.byteLength)
    let offset = 0

    this.data.forEach((data) => {
      result.set(data, offset)
      offset += data.byteLength
    })

    return result
  }
}
