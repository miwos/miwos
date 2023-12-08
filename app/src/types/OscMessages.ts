import type { ConnectionSerialized } from './Connection'
import type { Item } from './Item'
import type { ModulationSerialized } from './Modulation'
import type { Modulator } from './Modulator'
import type { KeysStartWith } from './utils'

// Each address must be prefixed with either `/r/` if it is a request or `/n/`
// if it is a notification and they must follow the pattern `/r/*/*` or `/n/*/*`.
// This strict pattern makes it easier to implement a catch-all message handling
// in the firmware (`BridgeLib.h`).
// - A request is asynchronous and expects a response from the device (similar
//   to an RPC).
// - A notification is simply an information to the device and doesn't expect an
//   answer.

// TODO: request should always expect some answer (at least `boolean`) and not just `void`.
export type OscMessages = {
  // Project
  '/r/project/open': (name: string) => void
  '/r/project/clear': () => void

  // Items
  '/r/items/add': (id: number, type: string) => void
  '/r/items/remove': (id: number) => void
  '/r/items/prop': (id: number, name: string, value: unknown) => boolean
  '/r/items/definition': (type: string) => string
  '/r/items/definitions': () => string

  // Connections
  '/r/connections/add': (...args: ConnectionSerialized) => void
  '/r/connections/remove': (...args: ConnectionSerialized) => void

  // Mappings
  '/r/mappings/add': (
    page: number,
    slot: number,
    id: Item['id'],
    prop: string,
  ) => boolean
  '/r/mappings/remove': (page: number, slot: number) => boolean

  // Modulations
  '/r/modulations/add': (...args: ModulationSerialized) => void
  '/r/modulations/remove': (
    modulatorId: Modulator['id'],
    itemId: Item['id'],
    prop: string,
  ) => void
  '/r/modulations/amount': (
    modulatorId: Modulator['id'],
    itemId: Item['id'],
    prop: string,
    amount: number,
  ) => void

  // Midi
  '/r/midi/start': () => void
  '/r/midi/stop': () => void
  '/r/midi/tempo': (bpm: number) => void
  '/r/midi/info': () => string

  // Parts
  '/r/parts/select': (index: number) => boolean

  // Pages
  '/n/pages/select': (page: number) => void
}

export type OscRequestMessages = KeysStartWith<OscMessages, '/r/'>
export type OscNotifyMessages = KeysStartWith<OscMessages, '/n/'>
