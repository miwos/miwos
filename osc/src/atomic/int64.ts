import Atomic from '../atomic'

const MAX_INT64 = BigInt('9223372036854775807')
const MIN_INT64 = BigInt('-9223372036854775808')

/**
 * 64-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicInt64 extends Atomic {
  /**
   * Create an AtomicInt64 instance
   * @param Initial integer value
   */
  constructor(value?: bigint) {
    if (value && typeof value !== 'bigint') {
      throw new Error(
        'OSC AtomicInt64 constructor expects value of type BigInt',
      )
    }

    if (value && (value < MIN_INT64 || value > MAX_INT64)) {
      throw new Error('OSC AtomicInt64 value is out of bounds')
    }

    let tmp: bigint
    if (value) {
      tmp = BigInt.asIntN(64, value)
    }

    super(tmp)
  }

  /**
   * Interpret the given number as packed binary data
   * @return Packed binary data
   */
  pack(): Uint8Array {
    const byteLength = 8
    const data = new Uint8Array(byteLength)
    const dataView = new DataView(data.buffer)
    dataView.setBigInt64(this.offset, this.value, false)
    return data
  }

  /**
   * Unpack binary data from DataView and read a Int64 number
   * @param dataView The DataView holding the binary representation of the value
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const byteLength = 8
    this.value = dataView.getBigInt64(initialOffset, false)
    this.offset = initialOffset + byteLength
    return this.offset
  }
}
