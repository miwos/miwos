import type { Point, Signal } from '.'

export type ItemCategory = 'modules' | 'modulators'

export interface Item {
  id: number
  category: ItemCategory
  type: string
  label: string
  props: Record<string, unknown>
  position: Point
}

export interface ItemSerialized {
  id: number
  category: ItemCategory
  type: string
  label?: string
  props?: Record<string, unknown>
  position?: [x: number, y: number]
}

export interface ItemDefinition {
  id: string
  category: ItemCategory
  label?: string
  props: Record<string, { type: string; options: Record<string, any> }>
  inputs: { signal: Signal }[]
  outputs: { signal: Signal }[]
}

export interface ItemDefinitionSerialized {
  id: string
  category: ItemCategory
  label?: string
  props?: Record<string, [type: string, options: Record<string, any>]>
  inputs?: Signal[]
  outputs?: Signal[]
}
