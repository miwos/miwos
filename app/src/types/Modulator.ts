import type {
  Item,
  ItemDefinition,
  ItemDefinitionSerialized,
  ItemSerialized,
} from './Item'

export interface Modulator extends Item {}

export interface ModulatorSerialized extends ItemSerialized {}

export interface ModulatorDefinition extends ItemDefinition {}

export interface ModulatorDefinitionSerialized
  extends ItemDefinitionSerialized {}
