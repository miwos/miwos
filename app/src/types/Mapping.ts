import type { Item } from './Item'

export interface Mapping {
  page: number
  slot: number
  itemId: Item['id']
  prop: string
}

export type MappingSerialized = [itemId: number, prop: string]

export type MappingPage = Map<Mapping['slot'], Mapping>

export type MappingPageSerialized = Record<number, MappingSerialized>
