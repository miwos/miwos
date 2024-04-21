import Atomic from './atomic'
import AtomicBlob from './atomic/blob'
import {
  VALUE_FALSE,
  VALUE_INFINITY,
  VALUE_NONE,
  VALUE_TRUE,
} from './atomic/constant'
import AtomicFloat32 from './atomic/float32'
import AtomicFloat64 from './atomic/float64'
import AtomicInt32 from './atomic/int32'
import AtomicInt64 from './atomic/int64'
import AtomicString from './atomic/string'
import AtomicUInt64 from './atomic/uint64'
import Helper, { prepareAddress, typeTag } from './common/helpers'
import { isArray, isString, isUndefined } from './common/utils'
import {
  type MessageArgObject,
  type MessageArgType,
  type MessageArgValue,
} from './types'

/**
 * @example
 * const messageArgObject = {
 *   type: 'i', value: 123
 * }
 */
export class TypedMessage {
  private offset = 0
  address = ''
  types = ''
  args: MessageArgValue[] = []

  /**
   * Create a TypedMessage instance
   * @param address Address
   * @param args Arguments
   *
   * @example
   * const message = new TypedMessage(['test', 'path'])
   * message.add('d', 123.123456789)
   * message.add('s', 'hello')
   *
   * @example
   * const message = new TypedMessage('/test/path', [
   *   { type: 'i', value: 123 },
   *   { type: 'd', value: 123.123 },
   *   { type: 'h', value: 0xFFFFFFn },
   *   { type: 'T', value: null },
   * ])
   */
  constructor(address?: string[] | string, args?: MessageArgObject[]) {
    if (!isUndefined(address)) {
      if (!(isString(address) || isArray(address))) {
        throw new Error(
          'OSC Message constructor first argument (address) must be a string or array',
        )
      }
      this.address = prepareAddress(address)
    }

    if (!isUndefined(args)) {
      if (!isArray(args)) {
        throw new Error(
          'OSC Message constructor second argument (args) must be an array',
        )
      }
      args.forEach((item) => this.add(item.type, item.value))
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   */
  add(type: MessageArgType, item?: MessageArgValue) {
    if (isUndefined(type)) {
      throw new Error('OSC Message needs a valid OSC Atomic Data Type')
    }

    if (type === 'N') {
      this.args.push(VALUE_NONE)
    } else if (type === 'T') {
      this.args.push(VALUE_TRUE)
    } else if (type === 'F') {
      this.args.push(VALUE_FALSE)
    } else if (type === 'I') {
      this.args.push(VALUE_INFINITY)
    } else if (item) {
      this.args.push(item)
    }

    this.types += type
  }

  /**
   * Interpret the Message as packed binary data
   * @return Packed binary data
   */
  pack(): Uint8Array {
    if (this.address.length === 0 || this.address[0] !== '/') {
      throw new Error('OSC Message has an invalid address')
    }

    const encoder = new Helper()

    // OSC Address Pattern and Type string
    encoder.add(new AtomicString(this.address))
    encoder.add(new AtomicString(`,${this.types}`))

    // followed by zero or more OSC Arguments
    if (this.args.length > 0) {
      let argument: Atomic | boolean | number | null

      if (this.args.length > this.types.length) {
        throw new Error('OSC Message argument and type tag mismatch')
      }

      this.args.forEach((value, index) => {
        const type = this.types[index]
        if (type === 'i') {
          argument = new AtomicInt32(value as number)
        } else if (type === 'h') {
          argument = new AtomicInt64(value as bigint)
        } else if (type === 't') {
          argument = new AtomicUInt64(value as bigint)
        } else if (type === 'f') {
          argument = new AtomicFloat32(value as number)
        } else if (type === 'd') {
          argument = new AtomicFloat64(value as number)
        } else if (type === 's') {
          argument = new AtomicString(value as string)
        } else if (type === 'b') {
          argument = new AtomicBlob(value as Uint8Array)
        } else if (type === 'T') {
          argument = VALUE_TRUE
        } else if (type === 'F') {
          argument = VALUE_FALSE
        } else if (type === 'N') {
          argument = VALUE_NONE
        } else if (type === 'I') {
          argument = VALUE_INFINITY
        } else {
          throw new Error('OSC Message found unknown argument type')
        }

        encoder.add(argument)
      })
    }

    return encoder.merge()
  }

  /**
   * Unpack binary data to read a Message
   * @param dataView The DataView holding the binary representation of a Message
   * @param initialOffset Offset of DataView before unpacking
   * @return Offset after unpacking
   */
  unpack(dataView: DataView, initialOffset = 0): number {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Message expects an instance of type DataView.')
    }

    // read address pattern
    const address = new AtomicString()
    address.unpack(dataView, initialOffset)

    // read type string
    const types = new AtomicString()
    types.unpack(dataView, address.offset)

    if (address.value.length === 0 || address.value[0] !== '/') {
      throw new Error('OSC Message found malformed or missing address string')
    }

    if (types.value.length === 0 && types.value[0] !== ',') {
      throw new Error('OSC Message found malformed or missing type string')
    }

    let { offset } = types
    let next: Atomic | null
    let type: string

    const args = []

    // read message arguments (OSC Atomic Data Types)
    for (let i = 1; i < types.value.length; i += 1) {
      type = types.value[i]
      next = null

      if (type === 'i') {
        next = new AtomicInt32()
      } else if (type === 'h') {
        next = new AtomicInt64()
      } else if (type === 't') {
        next = new AtomicUInt64()
      } else if (type === 'f') {
        next = new AtomicFloat32()
      } else if (type === 'd') {
        next = new AtomicFloat64()
      } else if (type === 's') {
        next = new AtomicString()
      } else if (type === 'b') {
        next = new AtomicBlob()
      } else if (type === 'T') {
        args.push(VALUE_TRUE)
      } else if (type === 'F') {
        args.push(VALUE_FALSE)
      } else if (type === 'N') {
        args.push(VALUE_NONE)
      } else if (type === 'I') {
        args.push(VALUE_INFINITY)
      } else {
        throw new Error('OSC Message found unsupported argument type')
      }

      if (next) {
        offset = next.unpack(dataView, offset)
        args.push(next.value)
      }
    }

    this.offset = offset
    this.address = address.value
    this.types = types.value
    this.args = args

    return this.offset
  }
}

/**
 * An OSC message consists of an OSC Address Pattern followed
 * by an OSC Type Tag String followed by zero or more OSC Arguments
 */
export class Message extends TypedMessage {
  /**
   * Create a Message instance
   * @param address Address
   * @param args OSC Atomic Data Types
   *
   * @example
   * const message = new Message(['test', 'path'], 50, 100.52, 'test')
   *
   * @example
   * const message = new Message('/test/path', 51.2)
   */
  constructor(
    address?: string[] | string,
    ...args: [MessageArgObject[]] | MessageArgValue[]
  ) {
    let oscArgs: MessageArgObject[] | undefined = undefined

    if (args.length > 0) {
      if (args[0] instanceof Array) {
        oscArgs = args.shift() as MessageArgObject[]
      }
    }

    super(address, oscArgs)

    if (args.length > 0) {
      this.types = args.map((item: any) => typeTag(item)).join('')
      this.args = args as MessageArgValue[]
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {MessageArgValue} item
   */
  add(item: MessageArgValue) {
    super.add(typeTag(item) as MessageArgType, item)
  }
}
