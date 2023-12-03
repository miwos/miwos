import { isBlob, isUndefined, pad } from '../common/utils'

import Atomic from '../atomic'

/**
 * 8-bit bytes of arbitrary binary data OSC Atomic Data Type
 */
export default class AtomicBlob extends Atomic {
  /**
   * Create an AtomicBlob instance
   * @param value Binary data
   */
  constructor(value?: Uint8Array) {
    if (value && !isBlob(value)) {
      throw new Error(
        'OSC AtomicBlob constructor expects value of type Uint8Array',
      )
    }

    super(value)
  }

  /**
   * Interpret the given blob as packed binary data
   * @return Packed binary data
   */
  pack(): Uint8Array {
    if (isUndefined(this.value)) {
      throw new Error('OSC AtomicBlob can not be encoded with empty value')
    }

    const byteLength = pad(this.value.byteLength)
    const data = new Uint8Array(byteLength + 4)
    const dataView = new DataView(data.buffer)

    // an int32 size count
    dataView.setInt32(0, this.value.byteLength, false)
    // followed by 8-bit bytes of arbitrary binary data
    data.set(this.value, 4)

    return data
  }

  /**
   * Unpack binary data from DataView and read a blob
   * @param dataView The DataView holding the binary representation of the blob
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const byteLength = dataView.getInt32(initialOffset, false)
    this.value = new Uint8Array(dataView.buffer, initialOffset + 4, byteLength)
    this.offset = pad(initialOffset + 4 + byteLength)
    return this.offset
  }
}
