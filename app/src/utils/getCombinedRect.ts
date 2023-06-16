import type { Rect } from '@/types'

export const getCombinedRect = (rects: Rect[]) => {
  if (!rects.length) throw new Error('expected at least one rect')

  let rect = rects[0]
  if (rects.length === 1) return rect

  for (let i = 1; i < rects.length; i++) {
    const { x, y, width, height } = rects[i]
    const right = Math.max(rect.x + rect.width, x + width)
    const bottom = Math.max(rect.y + rect.height, y + height)

    rect.x = Math.min(rect.x, x)
    rect.y = Math.min(rect.y, y)

    rect.width = right - rect.x
    rect.height = bottom - rect.y
  }
  return rect
}
