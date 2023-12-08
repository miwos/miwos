import { isNumber } from '../common/utils'

import Atomic from '../atomic'

/**
 * 64-bit big-endian IEEE 754 floating point number OSC Atomic Data Type
 */
export default class AtomicFloat64 extends Atomic {
  /**
   * Create an AtomicFloat64 instance
   * @param value Float number
   */
  constructor(value?: number) {
    if (value && !isNumber(value)) {
      throw new Error(
        'OSC AtomicFloat64 constructor expects value of type float',
      )
    }

    super(value)
  }

  /**
   * Interpret the given number as packed binary data
   * @return Packed binary data
   */
  pack(): Uint8Array {
    const byteLength = 8
    const data = new Uint8Array(byteLength)
    const dataView = new DataView(data.buffer)
    dataView.setFloat64(this.offset, this.value, false)
    return data
  }

  /**
   * Unpack binary data from DataView and read a Float64 number
   * @param dataView The DataView holding the binary representation of the value
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const byteLength = 8
    this.value = dataView.getFloat64(initialOffset, false)
    this.offset = initialOffset + byteLength
    return this.offset
  }
}
