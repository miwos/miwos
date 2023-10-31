import type { Modulator } from './Modulator'

export interface Modulation {
  id: `${Modulation['itemId']}-${Modulation['prop']}`
  modulatorId: Modulator['id']
  itemId: number
  prop: string
  amount: number
}

export type ModulationSerialized = [
  modulatorId: Modulator['id'],
  itemId: number,
  prop: string,
  amount: number,
]
