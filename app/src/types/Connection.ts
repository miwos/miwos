import type { Point } from './Geometry'
import type { Item } from './Item'
import type { Signal } from './Signal'

export interface Connection {
  id: `${Item['id']},${number}-${Item['id']},${number}`
  from: { itemId: Item['id']; index: number }
  to: { itemId: Item['id']; index: number }
}

export interface TemporaryConnection {
  from?: Connection['from'] | Point
  to?: Connection['to'] | Point
}

export type ConnectionSerialized = [
  fromId: Item['id'],
  fromIndex: number,
  toId: Item['id'],
  toIndex: number,
]

export interface ConnectionPoint {
  id: `${ConnectionPoint['itemId']}-${ConnectionPoint['index']}`
  itemId: Item['id']
  index: number
  direction: 'in' | 'out'
  angle: number
  thru?: boolean
  signal: Signal
  position: Point
  absolutePosition: Point
}
