import type { Module } from './module'

export interface Mapping {
  slot: number
  moduleId: Module['id']
  prop: string
}

export type MappingSerialized = [moduleId: Module['id'], prop: string]

export type MappingPage = Map<Mapping['slot'], Mapping>

export type MappingPageSerialized = Record<number, MappingSerialized>
