import Atomic from '../atomic'

const MAX_UINT64 = BigInt('18446744073709551615')

/**
 * Unsigned 64-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicUInt64 extends Atomic {
  /**
   * Create an AtomicUInt64 instance
   * @param value Initial integer value
   */
  constructor(value?: bigint) {
    if (value && typeof value !== 'bigint') {
      throw new Error(
        'OSC AtomicUInt64 constructor expects value of type BigInt',
      )
    }

    if (value && (value < 0 || value > MAX_UINT64)) {
      throw new Error('OSC AtomicUInt64 value is out of bounds')
    }

    const tmp = value ? BigInt.asUintN(64, value) : undefined
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
    dataView.setBigUint64(this.offset, this.value, false)
    return data
  }

  /**
   * Unpack binary data from DataView and read a UInt64 number
   * @param dataView The DataView holding the binary representation of the value
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const byteLength = 8
    this.value = dataView.getBigUint64(initialOffset, false)
    this.offset = initialOffset + byteLength
    return this.offset
  }
}
