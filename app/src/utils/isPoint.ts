import type { Point } from '@/types'

export const isPoint = (obj: any): obj is Point =>
  obj.x !== undefined && obj.y !== undefined
