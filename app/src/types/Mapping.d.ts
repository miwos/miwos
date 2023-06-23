import type { Module } from './module'

export interface Mapping {
  slot: number
  targetId: number
  prop: string
}

export type MappingSerialized = [targetId: number, prop: string]

export type MappingPage = Map<Mapping['slot'], Mapping>

export type MappingPageSerialized = Record<number, MappingSerialized>
