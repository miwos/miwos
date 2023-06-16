import { useBridge } from '@/bridge'
import type { Module, ModuleSerialized, Optional } from '@/types'
import { unpackBytes } from '@/utils'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { useConnections } from './connections'
import { useDevice } from './device'
import { useModuleDefinitions } from './moduleDefinitions'
import { useModuleShapes } from './moduleShapes'
import { useProject } from './project'

type Id = Module['id']

const activeOutputDuration = 100 // ms

const getDefaultLabel = (type: Module['type']) =>
  useModuleDefinitions().get(type)?.label ?? type

export const serializeModule = (module: Module): ModuleSerialized => ({
  ...module,
  position: [module.position.x, module.position.y],
})

export const deserializeModule = (serialized: ModuleSerialized): Module => ({
  ...serialized,
  label: serialized.label ?? getDefaultLabel(serialized.type),
  props: serialized.props ?? {},
  position: {
    x: serialized.position?.[0] ?? 0,
    y: serialized.position?.[1] ?? 0,
  },
})

export const useModules = defineStore('module-instances', () => {
  const project = useProject()
  const device = useDevice()
  const definitions = useModuleDefinitions()
  const connections = useConnections()
  const shapes = useModuleShapes()
  const bridge = useBridge()

  const items = ref(new Map<Id, Module>())
  const focusedId = ref<Id>()
  const sortedIds = ref<Id[]>([])
  const selectedIds = ref(new Set<Id>())
  const isDragging = ref(false)
  const activeOutputIds = ref(new Set<string>())

  bridge.on('/e/modules/prop', ({ args: [id, name, value] }) => {
    const item = get(id)
    if (!item) return
    item.props[name] = value
  })

  const outputResetTimers: Record<string, number> = {}
  let sustainedIds = new Set<string>()
  bridge.on('/e/modules/active-outputs', ({ args }) => {
    const newSustainedIds = new Set<string>()
    for (const packed of args) {
      const [moduleId, indexAndSustained] = unpackBytes(packed)
      const index = indexAndSustained & 0x7f
      const isSustained = indexAndSustained >> 7
      const id = `${moduleId}-${index - 1}` // use zero-based index

      activeOutputIds.value.add(id)
      if (isSustained) {
        newSustainedIds.add(id)
      } else {
        window.clearTimeout(outputResetTimers[id])
        outputResetTimers[id] = window.setTimeout(
          () => activeOutputIds.value.delete(id),
          activeOutputDuration
        )
      }
    }

    for (const id of sustainedIds) {
      if (!newSustainedIds.has(id)) activeOutputIds.value.delete(id)
    }

    sustainedIds = newSustainedIds
  })

  // Getters
  const get = (id: Id) => {
    const item = items.value.get(id)
    if (!item) {
      console.warn(`module '${id}' not found`)
      return
    }
    return item
  }

  const getConnector = (id: Id, index: number, direction: 'in' | 'out') => {
    const item = get(id)
    if (!item) return

    const definition = definitions.get(item.type)
    if (!definition) return

    const definitionConnector = definitions.getConnector(
      item.type,
      index,
      direction
    )
    const shapeConnector = shapes.getConnector(
      definition.shape,
      index,
      direction
    )

    if (!definitionConnector || !shapeConnector) return
    return { ...definitionConnector, ...shapeConnector }
  }

  const activeInputIds = computed(
    () =>
      new Set<string>(
        Array.from(connections.activeIds.values()).map((id) => {
          const connection = connections.items.get(id)!
          return `${connection.to.moduleId}-${connection.to.index}`
        })
      )
  )

  const sortIndexes = computed(
    () => new Map(sortedIds.value.map((v, i) => [v, i]))
  )
  const getSortIndex = (id: Id) => sortIndexes.value.get(id)

  const selectedItems = computed(() => {
    const items = new Map<Module['id'], Module>()
    for (const id of selectedIds.value) {
      const item = get(id)
      if (item) items.set(id, item)
    }
    return items
  })

  const focusedItem = computed(() =>
    focusedId.value !== undefined ? get(focusedId.value) : undefined
  )

  // Actions
  const serialize = () => Array.from(items.value.values()).map(serializeModule)

  const deserialize = (serialized: ModuleSerialized[]) => {
    items.value.clear()
    for (const serializedModule of serialized) {
      const module = deserializeModule(serializedModule)
      add(module, false)
      // Make sure that future module ids won't clash with the currently added
      // module.
      project.nextId = Math.max(project.nextId, module.id + 1)
    }
  }

  const add = (
    module: Optional<Module, 'id' | 'props' | 'label'>,
    updateDevice = true
  ) => {
    module.id ??= project.nextId++
    module.props ??= definitions.getDefaultProps(module.type)
    module.label ??= module.type
    console.log(module)
    items.value.set(module.id, module as Module)
    sortedIds.value.push(module.id)

    if (updateDevice) device.update('/e/modules/add', [module.id, module.type])

    return module as Module
  }

  const remove = async (id: Id, updateDevice = true) => {
    const module = get(id)
    if (!module) return

    const removedConnections = connections.getByModuleId(id)
    removedConnections.forEach(({ id }) => connections.remove(id, false))
    // Wait for the connections to be removed, otherwise they might still be
    // there after the module has been deleted, causing warnings.
    await nextTick()

    if (focusedId.value === id) focusedId.value = undefined
    if (selectedIds.value.has(id)) selectedIds.value.delete(id)
    items.value.delete(id)
    sortedIds.value.splice(sortedIds.value.indexOf(id), 1)

    if (updateDevice) device.update('/e/modules/remove', [id])
    return { module, connections: removedConnections }
  }

  const focus = (id: Id | undefined) => {
    focusedId.value = id
    if (id === undefined) return
    sortedIds.value.splice(sortedIds.value.indexOf(id), 1).push(id)
    sortedIds.value.push(id)
  }

  const updateProp = (
    id: Id,
    name: string,
    value: unknown,
    updateDevice = true
  ) => {
    const item = get(id)
    if (!item) return

    item.props[name] = value
    if (updateDevice) device.update('/e/modules/prop', [id, name, value])
  }

  const clear = () => {
    items.value.clear()
    sortedIds.value = []
  }

  return {
    items,
    focusedId,
    focusedItem,
    selectedIds,
    selectedItems,
    isDragging,
    activeInputIds,
    activeOutputIds,
    serialize,
    deserialize,
    get,
    getConnector,
    getSortIndex,
    add,
    remove,
    focus,
    updateProp,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useModules as any, import.meta.hot))
