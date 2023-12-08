import { isInt } from '../common/utils'

import Atomic from '../atomic'

/**
 * 32-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicInt32 extends Atomic {
  /**
   * Create an AtomicInt32 instance
   * @param value Initial integer value
   */
  constructor(value?: number) {
    if (value && !isInt(value)) {
      throw new Error(
        'OSC AtomicInt32 constructor expects value of type number',
      )
    }

    super(value)
  }

  /**
   * Interpret the given number as packed binary data
   * @return Packed binary data
   */
  pack(): Uint8Array {
    const byteLength = 4
    const data = new Uint8Array(byteLength)
    const dataView = new DataView(data.buffer)
    dataView.setInt32(this.offset, this.value, false)
    return data
  }

  /**
   * Unpack binary data from DataView and read a Int32 number
   * @param dataView The DataView holding the binary representation of the value
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const byteLength = 4
    this.value = dataView.getInt32(initialOffset, false)
    this.offset = initialOffset + byteLength
    return this.offset
  }
}
