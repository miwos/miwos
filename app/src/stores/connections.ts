import type { Module, Optional, Point } from '@/types'
import type {
  Connection,
  ConnectionPoint,
  ConnectionSerialized,
  TemporaryConnection,
} from '@/types/Connection'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'
import { useModules } from './modules'
import { sortPointsByPosition } from '@/utils'

type Id = Connection['id']

export const serializeConnection = ({
  from,
  to,
}: Connection): ConnectionSerialized => [
  from.moduleId,
  from.index + 1, // use 1-based index
  to.moduleId,
  to.index + 1, // use 1-based index
]

export const deserializeConnection = (
  serialized: ConnectionSerialized
): Connection => {
  const [fromModuleId, fromIndex, toModuleId, toIndex] = serialized
  const from = { moduleId: fromModuleId, index: fromIndex - 1 } // use 0-based index
  const to = { moduleId: toModuleId, index: toIndex - 1 } // use 0-based index
  const id =
    `${from.moduleId},${from.index}-${to.moduleId},${to.index}` as const
  return { id, from, to }
}

export const useConnections = defineStore('connections', () => {
  const items = ref(new Map<Id, Connection>())
  const tempConnection = ref<TemporaryConnection>()

  const device = useDevice()
  const modules = useModules()

  // Getters
  const get = (id: Id) => {
    const item = items.value.get(id)
    if (!item) {
      console.warn(`connection '${id}' not found`)
      return
    }
    return item
  }

  const getByModuleId = (id: Module['id']) =>
    Array.from(items.value.values()).filter(
      (item) => item.from.moduleId === id || item.to.moduleId === id
    )

  const list = computed(() => Array.from(items.value.values()))

  const activeIds = computed((): Set<Id> => {
    const ids = new Set<Id>()
    for (const { id, from } of list.value) {
      const outputId = `${from.moduleId}-${from.index}`
      if (modules.activeOutputIds.has(outputId)) ids.add(id)
    }
    return ids
  })

  const sortIndexes = computed(
    () =>
      new Map(
        Array.from(items.value.entries()).map(([id, item]) => {
          // Make sure the line is always above the modules it is connecting.
          const sort = Math.max(
            modules.getSortIndex(item.from.moduleId) ?? 0,
            modules.getSortIndex(item.to.moduleId) ?? 0
          )
          return [id, sort]
        })
      )
  )
  const getSortIndex = (id: Id) => sortIndexes.value.get(id)

  // Actions
  const serialize = (): ConnectionSerialized[] =>
    Array.from(items.value.values()).map(serializeConnection)

  const deserialize = (serialized: ConnectionSerialized[]) => {
    items.value.clear()
    serialized.forEach((v) => add(deserializeConnection(v), false))
  }

  const add = (connection: Optional<Connection, 'id'>, updateDevice = true) => {
    const { from, to } = connection
    connection.id ??=
      `${from.moduleId},${from.index}-${to.moduleId},${to.index}` as const
    items.value.set(connection.id, connection as Connection)
    if (updateDevice) {
      const serialized = serializeConnection(connection as Connection)
      device.update('/e/connections/add', serialized)
    }
    return connection.id
  }

  const remove = (id: Id, updateDevice = true) => {
    const connection = items.value.get(id)
    items.value.delete(id)
    if (updateDevice && connection)
      device.update('/e/connections/remove', serializeConnection(connection))
    return connection
  }

  const clear = () => items.value.clear()

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
    items,
    tempConnection,
    activeIds,
    serialize,
    deserialize,
    get,
    getByModuleId,
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
    acceptHMRUpdate(useConnections as any, import.meta.hot)
  )
