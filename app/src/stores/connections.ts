import type { Item, Module, Optional } from '@/types'
import type {
  Connection,
  ConnectionPoint,
  ConnectionSerialized,
  TemporaryConnection,
} from '@/types/Connection'
import { sortPointsByPosition } from '@/utils'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'
import { useItems } from './items'

type Id = Connection['id']

export const serializeConnection = ({
  from,
  to,
}: Connection): ConnectionSerialized => [
  from.itemId,
  from.index + 1, // use 1-based index
  to.itemId,
  to.index + 1, // use 1-based index
]

export const deserializeConnection = (
  serialized: ConnectionSerialized,
): Connection => {
  const [fromItemId, fromIndex, toItemId, toIndex] = serialized
  const from = { itemId: fromItemId, index: fromIndex - 1 } // use 0-based index
  const to = { itemId: toItemId, index: toIndex - 1 } // use 0-based index
  const id = `${from.itemId},${from.index}-${to.itemId},${to.index}` as const
  return { id, from, to }
}

export const useConnections = defineStore('connections', () => {
  const map = ref(new Map<Id, Connection>())
  const tempConnection = ref<TemporaryConnection>()

  const device = useDevice()
  const items = useItems()

  // Getters
  const get = (id: Id) => {
    const item = map.value.get(id)
    if (!item) {
      console.warn(`connection '${id}' not found`)
      return
    }
    return item
  }

  const getByItemId = (id: Item['id']) =>
    Array.from(map.value.values()).filter(
      (item) => item.from.itemId === id || item.to.itemId === id,
    )

  const list = computed(() => Array.from(map.value.values()))

  const activeIds = computed((): Set<Id> => {
    const ids = new Set<Id>()
    for (const { id, from } of list.value) {
      const outputId = `${from.itemId}-${from.index}`
      if (items.activeOutputIds.has(outputId)) ids.add(id)
    }
    return ids
  })

  const sortIndexes = computed(
    () =>
      new Map(
        Array.from(map.value.entries()).map(([id, item]) => {
          // Make sure the line is always above the modules it is connecting.
          const sort = Math.max(
            items.getSortIndex(item.from.itemId) ?? 0,
            items.getSortIndex(item.to.itemId) ?? 0,
          )
          return [id, sort]
        }),
      ),
  )
  const getSortIndex = (id: Id) => sortIndexes.value.get(id)

  // Actions
  const serialize = (): ConnectionSerialized[] =>
    Array.from(map.value.values()).map(serializeConnection)

  const deserialize = (serialized: ConnectionSerialized[]) => {
    map.value.clear()
    serialized.forEach((v) => add(deserializeConnection(v), false))
  }

  const add = (connection: Optional<Connection, 'id'>, updateDevice = true) => {
    const { from, to } = connection
    connection.id ??=
      `${from.itemId},${from.index}-${to.itemId},${to.index}` as const
    map.value.set(connection.id, connection as Connection)
    if (updateDevice) {
      const serialized = serializeConnection(connection as Connection)
      device.update('/r/connections/add', serialized)
    }
    return connection.id
  }

  const remove = (id: Id, updateDevice = true) => {
    const connection = map.value.get(id)
    map.value.delete(id)
    if (updateDevice && connection)
      device.update('/r/connections/remove', serializeConnection(connection))
    return connection
  }

  const clear = () => map.value.clear()

  let startPoint: ConnectionPoint | undefined
  const connectFrom = (point: ConnectionPoint) => (startPoint = point)

  const connectTo = (point: ConnectionPoint) => {
    if (!startPoint) return

    const bothAreThru = point.thru && startPoint.thru

    // Sort the points so our connection will always flow from `out` to
    // `in`. If both points are of the special type `thru` we have to make a guess
    // based on the points positions, treating the higher point as `out` and the
    // lower as `in`. Otherwise we look for a point with a distinct direction
    // (not `thru`) and sort them based an that point.
    const connectionPoints = bothAreThru
      ? sortPointsByPosition(startPoint, point)
      : (!startPoint.thru && startPoint.direction === 'out') ||
        (!point.thru && point.direction === 'in')
      ? [startPoint, point]
      : [point, startPoint]

    const [from, to] = connectionPoints
    startPoint = undefined

    add({ from, to })
  }

  return {
    map,
    tempConnection,
    activeIds,
    serialize,
    deserialize,
    get,
    getByItemId,
    getSortIndex,
    add,
    remove,
    clear,
    connectFrom,
    connectTo,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useConnections as any, import.meta.hot),
  )
