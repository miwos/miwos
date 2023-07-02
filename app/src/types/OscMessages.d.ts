import type { ConnectionSerialized } from './Connection'
import type { ModulationSerialized, Modulator } from './Modulation'
import type { Module } from './Module'
import type { ModuleDefinitionSerialized } from './ModuleDefinition'
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
  // Parts
  '/r/parts/select': (index: number) => boolean

  // Connections
  '/r/connections/add': (...args: ConnectionSerialized) => void
  '/r/connections/remove': (...args: ConnectionSerialized) => void

  // Items
  '/r/items/add': (id: number, category: string, type: string) => void
  '/r/items/remove': (id: number) => void
  '/r/items/prop': (id: number, name: string, value: unknown) => boolean
  '/r/items/definitions': (category: string) => string
  '/r/items/definition': (category, name: string) => string

  // Modulations
  '/r/modulations/add': (...args: ModulationSerialized) => void
  '/r/modulations/remove': (
    modulatorId: Modulator['id'],
    moduleId: Module['id'],
    prop: string
  ) => void
  '/r/modulations/amount': (
    modulatorId: Modulator['id'],
    moduleId: Module['id'],
    prop: string,
    amount: number
  ) => void

  // Patch
  '/r/patch/clear': () => boolean

  // Mappings
  '/r/mappings/add': (
    page: number,
    slot: number,
    id: Module['id'],
    prop: string
  ) => boolean
  '/r/mappings/remove': (page: number, slot: number) => boolean

  // Pages
  '/n/pages/select': (page: number) => void
}

export type OscRequestMessages = KeysStartWith<OscMessages, '/r/'>
export type OscNotifyMessages = KeysStartWith<OscMessages, '/n/'>
