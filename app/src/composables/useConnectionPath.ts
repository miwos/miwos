import type { Connection, Point, TemporaryConnection } from '@/types'
import { getConnectionPoint, isPoint } from '@/utils'
import { computed } from 'vue'
import { createHobbyCurve } from 'hobby-curve'
import Vec from 'tiny-vec'

const weight = (value: number, weight: number) => 1 - weight + weight * value

const toDegrees = (radians: number) => radians * (180 / Math.PI)

const toRadians = (degrees: number) => degrees * (Math.PI / 180)

export const useConnectionPath = (
  connection: Connection | TemporaryConnection
) =>
  computed(() => {
    const from = isPoint(connection.from)
      ? undefined
      : getConnectionPoint(
          connection.from.moduleId,
          connection.from.index,
          'out'
        )
    const fromPosition = new Vec(from?.position ?? (connection.from as Point))

    const to = isPoint(connection.to)
      ? undefined
      : getConnectionPoint(connection.to.moduleId, connection.to.index, 'in')
    const toPosition = new Vec(to?.position ?? (connection.to as Point))

    const controls: Point[] = []
    const distance = toPosition.subtract(fromPosition)
    const toIsAbove = distance.y < 0
    const toIsLeft = distance.x < 0

    // The closer `to` and `from` are from each other. If they are more than
    // 600px apart we don't consider them close at all.
    const verticalCloseness = 1 - Math.min(Math.abs(distance.y), 600) / 600
    const verticalApartness = 1 - verticalCloseness

    const horizontalCloseness = 1 - Math.min(Math.abs(distance.x), 600) / 600
    const horizontalApartness = 1 - horizontalCloseness

    const signHorizontal = toIsLeft ? -1 : 1
    const signVertical = toIsAbove ? -1 : 1

    // Handle offset based on the horizontal distance and scaled by the vertical
    // closeness.
    let offset = distance.x * (0.02 * verticalCloseness + 0.02)

    // In case `to` is above `from` we need to increase the handle offset to
    // create smoother "S" shaped lines.
    if (toIsAbove) {
      offset +=
        300 *
        weight(horizontalApartness, 0.7) *
        verticalApartness *
        signHorizontal
    }

    const length =
      15 * horizontalApartness + 45 * verticalApartness * signVertical

    if (from) {
      controls.push(
        new Vec(fromPosition).add(
          new Vec(0, -1)
            .multiply(length)
            .rotate(toRadians(from.angle - 90))
            .add({ x: offset, y: 0 })
        )
      )
    } else {
      const angle = Math.PI
      controls.push(
        new Vec(fromPosition)
          .add(new Vec(0, -1).multiply(length).rotate(angle))
          .add({ x: offset, y: 0 })
      )
    }

    if (to) {
      controls.push(
        new Vec(toPosition).add(
          new Vec(0, -1)
            .multiply(length)
            .rotate(toRadians(to.angle - 90))
            .add({ x: -offset, y: 0 })
        )
      )
    } else {
      const angle = 0
      controls.push(
        new Vec(toPosition)
          .add(new Vec(0, -1).multiply(length).rotate(angle))
          .add({ x: -offset, y: 0 })
      )
    }

    if (fromPosition.x === toPosition.x && toPosition.y === fromPosition.y) {
      return
    }

    const data = createHobbyCurve([fromPosition, ...controls, toPosition])
    return { data, controls }
  })
