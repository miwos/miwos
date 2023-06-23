import type { Module } from './module'

export interface Mapping {
  page: number,
  slot: number
  itemId: number
  prop: string
}

export type MappingSerialized = [itemId: number, prop: string]

export type MappingPage = Map<Mapping['slot'], Mapping>

export type MappingPageSerialized = Record<number, MappingSerialized>
