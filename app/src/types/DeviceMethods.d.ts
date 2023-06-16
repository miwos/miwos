import type { ConnectionSerialized } from './Connection'
import type { ModulationSerialized, Modulator } from './Modulation'
import type { Module } from './Module'
import type { ModuleDefinitionSerialized } from './ModuleDefinition'

export type DeviceMethods = {
  '/e/parts/select': (index: number) => boolean

  '/e/connections/add': (...args: ConnectionSerialized) => void
  '/e/connections/remove': (...args: ConnectionSerialized) => void

  '/e/modules/add': (id: Module['id'], type: Module['type']) => void
  '/e/modules/remove': (id: Module['id']) => void
  '/e/modules/prop': (id: Module['id'], name: string, value: unknown) => boolean
  '/e/modules/definitions': () => string
  '/e/modules/definition': (moduleName: string) => string

  '/e/modulators/add': (id: Modulator['id'], type: Modulator['type']) => void
  '/e/modulators/remove': (id: Modulator['id']) => void

  '/e/modulations/add': (...args: ModulationSerialized) => void
  '/e/modulations/remove': (
    modulatorId: Modulator['id'],
    moduleId: Module['id'],
    prop: string
  ) => void
  '/e/modulations/amount': (
    modulatorId: Modulator['id'],
    moduleId: Module['id'],
    prop: string,
    amount: number
  ) => void

  '/e/patch/clear': () => boolean

  '/e/mappings/add': (
    page: number,
    slot: number,
    id: Module['id'],
    prop: string
  ) => boolean
  '/e/mappings/remove': (page: number, slot: number) => boolean
}
