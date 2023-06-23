import type { ConnectionSerialized } from './Connection'
import type { ModulationSerialized, Modulator } from './Modulation'
import type { Module } from './Module'
import type { ModuleDefinitionSerialized } from './ModuleDefinition'

export type DeviceMethods = {
  '/e/parts/select': (index: number) => boolean

  '/e/connections/add': (...args: ConnectionSerialized) => void
  '/e/connections/remove': (...args: ConnectionSerialized) => void

  '/e/items/add': (id: number, category: string, type: string) => void
  '/e/items/remove': (id: number) => void
  '/e/items/prop': (id: number, name: string, value: unknown) => boolean
  '/e/items/definitions': (category: string) => string
  '/e/items/definition': (category, name: string) => string
  
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
