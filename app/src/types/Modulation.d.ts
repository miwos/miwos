import type { ModuleSerialized } from './module'
import type { Module } from './module'

export interface Modulator extends Module {}

export interface ModulatorSerialized extends ModuleSerialized {}

export interface ModulatorDefinition {
  id: string
  label?: string
  props: Record<string, { type: string; options: Record<string, any> }>
}

export interface ModulatorDefinitionSerialized {
  id: string
  label?: string
  props?: Record<string, [type: string, options: Record<string, any>]>
}

export interface Modulation {
  id: `${Modulation['moduleId']}-${Modulation['prop']}`
  modulatorId: Modulator['id']
  moduleId: Module['id']
  prop: string
  amount: number
}

export type ModulationSerialized = [
  modulatorId: Modulator['id'],
  moduleId: Module['id'],
  prop: string,
  amount: number
]
