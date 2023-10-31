import type { Shape } from '@miwos/shape'
import type { Point, Size } from './Geometry'
import type {
  Item,
  ItemDefinition,
  ItemDefinitionSerialized,
  ItemSerialized,
} from './Item'

export interface Module extends Item {
  size?: Size
}

export interface ModuleSerialized extends ItemSerialized {}

export interface ModuleDefinition extends ItemDefinition {
  shape: Shape['id']
  clipContent: boolean
  showLabel: boolean
}

export interface ModuleDefinitionSerialized extends ItemDefinitionSerialized {
  shape: Shape['id']
  clipContent: boolean
  showLabel: boolean
}
