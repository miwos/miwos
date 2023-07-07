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
import { useMappings } from './mappings'
import { useModulations } from './modulations'

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
  const mappings = useMappings()
  const modulations = useModulations()
  const shapes = useModuleShapes()
  const bridge = useBridge()

  const items = ref(new Map<Id, Module>())
  const focusedId = ref<Id>()
  const sortedIds = ref<Id[]>([])
  const selectedIds = ref(new Set<Id>())
  const isDragging = ref(false)
  const activeOutputIds = ref(new Set<string>())

  const outputResetTimers: Record<string, number> = {}
  let sustainedIds = new Set<string>()
  bridge.on('/n/modules/active-outputs', ({ args }) => {
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

  const isModule = (id: Id) => items.value.has(id)

  // Actions
  const serialize = () => Array.from(items.value.values()).map(serializeModule)

  const deserialize = (serialized: ModuleSerialized[]) => {
    items.value.clear()
    for (const serializedModule of serialized) {
      const module = deserializeModule(serializedModule)
      add(module, false)
      // Make sure that future module ids won't clash with the currently added
      // module.
      project.nextItemId = Math.max(project.nextItemId, module.id + 1)
    }
  }

  const add = (
    module: Optional<Module, 'id' | 'props' | 'label'>,
    updateDevice = true
  ) => {
    module.id ??= project.nextItemId++
    module.props ??= definitions.getDefaultProps(module.type)
    module.label ??= module.type
    console.log(module)
    items.value.set(module.id, module as Module)
    sortedIds.value.push(module.id)

    if (updateDevice)
      device.update('/r/items/add', [module.id, 'modules', module.type])

    return module as Module
  }

  const remove = async (id: Id, updateDevice = true) => {
    const module = get(id)
    if (!module) return

    // Cleanup everything that was related to the deleted module.
    connections
      .getByModuleId(id)
      .forEach(({ id }) => connections.remove(id, false))

    mappings
      .getByItemId(id)
      .value.forEach(({ page, slot }) => mappings.remove(page, slot))

    modulations
      .getByItemId(id)
      .value.forEach(({ id }) => modulations.remove(id))

    // Wait until everything is cleaned up. Otherwise there might still be
    // references around to the cleaned up objects. E.g.: omitting this throws
    // a warning caused by a ConnectionPoint still referencing the module.
    await nextTick()

    if (focusedId.value === id) focusedId.value = undefined
    if (selectedIds.value.has(id)) selectedIds.value.delete(id)
    items.value.delete(id)
    sortedIds.value.splice(sortedIds.value.indexOf(id), 1)

    if (updateDevice) device.update('/r/items/remove', [id])
  }

  const focus = (id: Id | undefined) => {
    focusedId.value = id
    if (id === undefined) return
    sortedIds.value.splice(sortedIds.value.indexOf(id), 1).push(id)
    sortedIds.value.push(id)
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
    isModule,
    add,
    remove,
    focus,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useModules as any, import.meta.hot))
