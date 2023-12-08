import { isString, isUndefined, pad } from '../common/utils'

import Atomic from '../atomic'

/** Text encoding format */
const STR_ENCODING = 'utf-8'

/**
 * Helper method to decode a string
 * @param charCodes Array of char codes
 * @return Decoded string
 */
function charCodesToString(charCodes: number[]): string {
  return new TextDecoder(STR_ENCODING).decode(new Int8Array(charCodes))
}

/**
 * A sequence of non-null ASCII characters OSC Atomic Data Type
 */
export default class AtomicString extends Atomic {
  /**
   * Create an AtomicString instance
   * @param value Initial string value
   */
  constructor(value?: string) {
    if (value && !isString(value)) {
      throw new Error(
        'OSC AtomicString constructor expects value of type string',
      )
    }

    super(value)
  }

  /**
   * Interpret the given string as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack(): Uint8Array {
    if (isUndefined(this.value)) {
      throw new Error('OSC AtomicString can not be encoded with empty value')
    }

    // add 0-3 null characters for total number of bits a multiple of 32
    const terminated = `${this.value}\u0000`
    const byteLength = pad(terminated.length)

    const buffer = new Uint8Array(byteLength)

    for (let i = 0; i < terminated.length; i += 1) {
      buffer[i] = terminated.charCodeAt(i)
    }

    return buffer
  }

  /**
   * Unpack binary data from DataView and read a string
   * @param dataView The DataView holding the binary representation of the string
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    let offset = initialOffset
    let charCode: number
    const charCodes = []

    for (; offset < dataView.byteLength; offset += 1) {
      charCode = dataView.getUint8(offset)

      // check for terminating null character
      if (charCode !== 0) {
        charCodes.push(charCode)
      } else {
        offset += 1
        break
      }
    }

    if (offset === dataView.byteLength) {
      throw new Error('OSC AtomicString found a malformed OSC string')
    }

    this.offset = pad(offset)
    this.value = charCodesToString(charCodes)

    return this.offset
  }
}
