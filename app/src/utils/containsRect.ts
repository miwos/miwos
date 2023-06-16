import type { Rect } from '@/types'

export const containsRect = (a: Rect, b: Rect) =>
  b.x >= a.x &&
  b.y >= a.y &&
  b.x + b.width <= a.x + a.width &&
  b.y + b.height <= a.y + a.height
