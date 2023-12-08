/**
 * Base class for OSC Atomic Data Types
 */
export default abstract class Atomic {
  offset = 0
  value: any

  /**
   * Create an Atomic instance
   * @param Initial value of any type
   */
  constructor(value?: any) {
    this.value = value
  }

  /**
   * Interpret the given value of this entity as packed binary data
   * @param method The DataView method to write to the ArrayBuffer
   * @param byteLength Size of array in bytes
   * @return Packed binary data
   */
  abstract pack(method: string, byteLength: number): Uint8Array

  /**
   * Unpack binary data from DataView according to the given format
   * @param dataView The DataView holding the binary representation of the value
   * @param initialOffset Offset of DataView before unpacking
   */
  abstract unpack(dataView: DataView, initialOffset?: number): number
}
