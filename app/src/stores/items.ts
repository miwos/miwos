import { useBridge } from '@/bridge'
import {
  type Item,
  type Modulator,
  type ModulatorDefinition,
  type Module,
  type ModuleDefinition,
  type Optional,
} from '@/types'
import type {
  ItemDefinition,
  ItemDefinitionSerialized,
  ItemSerialized,
} from '@/types/Item'
import { luaToJson, unpackBytes } from '@/utils'
import { parseSVG, type Shape } from '@miwos/shape'
import Fuse from 'fuse.js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { useConnections } from './connections'
import { useDevice } from './device'
import { useMappings } from './mappings'
import { useModulations } from './modulations'

const importedShapes = Object.entries(
  import.meta.glob('@/assets/shapes/*.svg', { eager: true }),
).map(([key, module]) => {
  const svg = (module as any).default
  const name = key.split('/').at(-1)?.split('.')[0]!
  return [name, parseSVG(name, svg)]
}) as [Shape['id'], Shape][]

type Id = number

let fuse: Fuse<string> | undefined
const indexSearch = (keys: string[]) =>
  (fuse = new Fuse(keys, { minMatchCharLength: 2 }))

export const useItems = defineStore('items', () => {
  const instances = ref(new Map<Id, Item>())
  const definitions = ref(new Map<Item['type'], ItemDefinition>())
  const shapes = ref(new Map<Shape['id'], Shape>(importedShapes))

  const isDragging = ref(false)
  const sortedIds = ref<Id[]>([])
  const selectedIds = ref(new Set<Id>())
  const activeOutputIds = ref(new Set<string>())
  let nextId = 1

  const bridge = useBridge()
  const device = useDevice()
  const connections = useConnections()
  const mappings = useMappings()
  const modulations = useModulations()

  // Init
  indexSearch(Array.from(definitions.value.keys()))

  bridge.on('/n/items/prop', ({ args: [id, name, value] }) => {
    const item = instances.value.get(id)
    if (!item) throw new Error(`Item with id '${id}' not found`)
    item.props[name] = value
  })

  const activeOutputDuration = 100 // ms
  const outputResetTimers: Record<string, number> = {}
  let sustainedIds = new Set<string>()
  bridge.on('/n/items/active-outputs', ({ args }) => {
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
          activeOutputDuration,
        )
      }
    }

    for (const id of sustainedIds) {
      if (!newSustainedIds.has(id)) activeOutputIds.value.delete(id)
    }

    sustainedIds = newSustainedIds
  })

  // Helpers
  const getDefaultLabel = (type: Item['type']) =>
    definitions.value.get(type)?.label ?? type

  const serializeItem = (item: Item): ItemSerialized => ({
    ...item,
    position: item.position ? [item.position.x, item.position.y] : undefined,
  })

  const deserializeItem = (serialized: ItemSerialized): Item => ({
    ...serialized,
    label: serialized.label ?? getDefaultLabel(serialized.type),
    props: serialized.props ?? {},
    modulatedProps: {},
    position: {
      x: serialized.position?.[0] ?? 0,
      y: serialized.position?.[1] ?? 0,
    },
  })

  const deserializeDefinition = (serialized: ItemDefinitionSerialized) => {
    const { id, label, inputs, outputs, props = {} } = serialized
    const definition = {
      // Add any additional properties that are specific only to certain
      // categories of items.
      ...serialized,
      id,
      label: label ?? id,
      inputs: inputs?.map((signal) => ({ signal })) ?? [],
      outputs: outputs?.map((signal) => ({ signal })) ?? [],
      props: Object.fromEntries(
        Object.entries(props).map(([name, [type, options]]) => [
          name,
          { type, options },
        ]),
      ),
    }
    definitions.value.set(id, definition)
  }

  // Getters
  const instancesByCategory = computed(() => {
    const categorized = {
      modules: new Map<Item['id'], Module>(),
      modulators: new Map<Item['id'], Modulator>(),
    }
    for (const [id, item] of instances.value.entries()) {
      const category = definitions.value.get(item.type)?.category
      if (!category || !categorized[category]) {
        console.warn(`Category '${item.category}' of item '${item.type}' not found.`)
        continue
      }
      categorized[category].set(id, item)
    }
    return categorized
  })
  const modules = computed(() => instancesByCategory.value.modules)
  const modulators = computed(() => instancesByCategory.value.modulators)

  const definitionsByCategory = computed(() => {
    const categorized = {
      modules: new Map<ItemDefinition['id'], ModuleDefinition>(),
      modulators: new Map<ItemDefinition['id'], ModulatorDefinition>(),
    }
    for (const [id, definition] of definitions.value.entries()) {
      categorized[definition.category].set(id, definition as any)
    }
    return categorized
  })

  const moduleDefinitions = computed(() => definitionsByCategory.value.modules)
  const modulatorDefinitions = computed(
    () => definitionsByCategory.value.modulators,
  )

  const selectedItems = computed(() => {
    const items = new Map<Item['id'], Item>()
    for (const id of selectedIds.value) {
      const item = instances.value.get(id)
      if (item) items.set(id, item)
    }
    return items
  })

  const sortIndexes = computed(
    () => new Map(sortedIds.value.map((v, i) => [v, i])),
  )
  const getSortIndex = (id: Id) => sortIndexes.value.get(id)

  const activeInputIds = computed(
    () =>
      new Set<string>(
        Array.from(connections.activeIds.values()).map((id) => {
          const connection = connections.map.get(id)!
          return `${connection.to.itemId}-${connection.to.index}`
        }),
      ),
  )

  // Actions
  const serialize = () =>
    Array.from(instances.value.values()).map(serializeItem)

  const deserialize = (serialized: ItemSerialized[]) => {
    instances.value.clear()
    for (const serializedItem of serialized) {
      const item = deserializeItem(serializedItem)
      add(item, false)
      // Make sure that future module ids won't clash with the currently added
      // module.
      nextId = Math.max(nextId, item.id + 1)
    }
  }

  const searchDefinitions = (query: string): ItemDefinition[] =>
    fuse?.search(query).map(({ item: id }) => definitions.value.get(id)!) ?? []

  const add = (
    item: Optional<Item, 'id' | 'props' | 'label'>,
    updateDevice = true,
  ) => {
    const definition = definitions.value.get(item.type)
    if (!definition) throw new Error(`definition '${item.type}' not found`)

    item.id ??= nextId++
    item.label ??= item.type

    if (!item.props) {
      const defaultProps = Object.fromEntries(
        Object.entries(definition.props).map(([name, { options }]) => [
          name,
          options.value,
        ]),
      )
      item.props = defaultProps
    }

    // We made sure the optional `id`, `props`, and `label` are there so it is
    // save to cast.
    instances.value.set(item.id, item as Item)
    sortedIds.value.push(item.id)

    if (updateDevice) device.update('/r/items/add', [item.id, item.type])

    return item
  }

  const remove = async (id: Id, updateDevice = true) => {
    const item = instances.value.get(id)
    if (!item) throw new Error(`item with id '${id}' not found`)

    const definition = definitions.value.get(item.type)
    if (!definition) throw new Error(`definition '${item.type}' not found`)

    // Cleanup everything that was related to the deleted item.
    connections.getByItemId(id).forEach(({ id }) => connections.remove(id))

    mappings
      .getByItemId(id)
      .value.forEach(({ page, slot }) => mappings.remove(page, slot))

    // The deleted item can be modulated or be a modulator itself.
    modulations.getByModulatorId(id).forEach(({ id }) => modulations.remove(id))
    modulations
      .getByItemId(id)
      .value.forEach(({ id }) => modulations.remove(id))

    // Wait until everything is cleaned up. Otherwise there might still be
    // references around to the cleaned up objects. E.g.: omitting this throws
    // a warning caused by a ConnectionPoint still referencing the module.
    await nextTick()

    selectedIds.value.delete(id)
    instances.value.delete(id)
    sortedIds.value.splice(sortedIds.value.indexOf(id), 1)

    if (updateDevice) device.update('/r/items/remove', [id])
  }

  const clear = () => instances.value.clear()

  const updateDefinition = async (type: Item['type']) => {
    const result = await device.request('/r/items/definition', [type])
    if (!result) return
    deserializeDefinition(luaToJson(result))
    indexSearch(Array.from(definitions.value.keys()))
  }

  const updateDefinitions = async () => {
    const result = await device.request('/r/items/definitions')
    if (!result) return
    definitions.value.clear()
    const serialized = <Map<ItemDefinition['id'], ItemDefinitionSerialized>>(
      luaToJson(result)
    )
    Object.values(serialized).forEach(deserializeDefinition)
    indexSearch(Array.from(definitions.value.keys()))
  }

  const updateProp = (
    id: number,
    name: string,
    value: unknown,
    updateDevice = true,
  ) => {
    const item = instances.value.get(id)
    if (!item) throw new Error(`Item with id '${id}' not found`)

    item.props[name] = value
    if (updateDevice) device.update('/r/items/prop', [id, name, value])
  }

  return {
    instances,
    modules,
    modulators,
    definitions,
    moduleDefinitions,
    modulatorDefinitions,
    selectedItems,
    shapes,
    isDragging,
    selectedIds,
    activeInputIds,
    activeOutputIds,
    serialize,
    deserialize,
    searchDefinitions,
    add,
    remove,
    clear,
    updateDefinition,
    updateDefinitions,
    updateProp,
    getSortIndex,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useItems, import.meta.hot))
