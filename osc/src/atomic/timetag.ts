import { isDate, isInt, isUndefined } from '../common/utils'

import Atomic from '../atomic'

/** 70 years in seconds */
export const SECONDS_70_YEARS = 2208988800
/** 2^32 */
export const TWO_POWER_32 = 4294967296

/**
 * Timetag helper class for representing NTP timestamps
 * and conversion between them and javascript representation
 */
export class Timetag {
  seconds: number
  fractions: number

  /**
   * Create a Timetag instance
   * @param seconds Initial NTP *seconds* value
   * @param fractions Initial NTP *fractions* value
   */
  constructor(seconds = 0, fractions = 0) {
    if (!(isInt(seconds) && isInt(fractions))) {
      throw new Error(
        'OSC Timetag constructor expects values of type integer number',
      )
    }

    this.seconds = seconds
    this.fractions = fractions
  }

  /**
   * Converts from NTP to JS representation and back
   * @param milliseconds Converts from JS milliseconds to NTP.
   * Leave empty for converting from NTP to JavaScript representation
   * @return Javascript timestamp
   */
  timestamp(milliseconds?: number): number {
    let seconds: number

    if (typeof milliseconds === 'number') {
      seconds = milliseconds / 1000
      const rounded = Math.floor(seconds)

      this.seconds = rounded + SECONDS_70_YEARS
      this.fractions = Math.round(TWO_POWER_32 * (seconds - rounded))

      return milliseconds
    }

    seconds = this.seconds - SECONDS_70_YEARS
    return (seconds + Math.round(this.fractions / TWO_POWER_32)) * 1000
  }
}

/**
 * 64-bit big-endian fixed-point time tag, semantics
 * defined below OSC Atomic Data Type
 */
export default class AtomicTimetag extends Atomic {
  /**
   * Create a AtomicTimetag instance
   * @param {number|Timetag|Date} [value] Initial date, leave empty if
   * you want it to be the current date
   */
  constructor(value: number | Timetag | Date = Date.now()) {
    let timetag = new Timetag()

    if (value instanceof Timetag) {
      timetag = value
    } else if (isInt(value)) {
      timetag.timestamp(value)
    } else if (isDate(value)) {
      timetag.timestamp(value.getTime())
    }

    super(timetag)
  }

  /**
   * Interpret the given timetag as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack(): Uint8Array {
    if (isUndefined(this.value)) {
      throw new Error('OSC AtomicTimetag can not be encoded with empty value')
    }

    const { seconds, fractions } = this.value
    const data = new Uint8Array(8)
    const dataView = new DataView(data.buffer)

    dataView.setInt32(0, seconds, false)
    dataView.setInt32(4, fractions, false)

    return data
  }

  /**
   * Unpack binary data from DataView and read a timetag
   * @param dataView The DataView holding the binary representation of the timetag
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    const seconds = dataView.getUint32(initialOffset, false)
    const fractions = dataView.getUint32(initialOffset + 4, false)
    this.value = new Timetag(seconds, fractions)
    this.offset = initialOffset + 8

    return this.offset
  }
}
