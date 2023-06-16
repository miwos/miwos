import type { ModuleDefinition, ModuleDefinitionSerialized } from '@/types'
import { luaToJson } from '@/utils'
import Fuse from 'fuse.js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { useDevice } from './device'
import { useModuleShapes } from './moduleShapes'

type Id = ModuleDefinition['id']

let fuse: Fuse<string> | undefined
const indexSearch = (keys: string[]) => {
  fuse = new Fuse(keys, { minMatchCharLength: 2 })
}

export const useModuleDefinitions = defineStore('module definitions', () => {
  const items = ref(
    new Map<Id, ModuleDefinition>([
      [
        'Input',
        {
          id: 'Input',
          inputs: [],
          outputs: [
            {
              signal: 'midi',
            },
          ],
          shape: 'Input',
          clipContent: false,
          showLabel: false,
          props: {
            device: {
              type: 'Number',
              options: {
                value: 1,
                max: 13,
                step: 1,
                min: 1,
                listed: false,
              },
            },
            cable: {
              type: 'Number',
              options: {
                value: 1,
                max: 16,
                step: 1,
                min: 1,
                listed: false,
              },
            },
          },
        },
      ],
      [
        'Output',
        {
          id: 'Output',
          inputs: [
            {
              signal: 'midi',
            },
          ],
          outputs: [],
          shape: 'Output',
          clipContent: false,
          showLabel: false,
          props: {
            device: {
              type: 'Number',
              options: {
                value: 1,
                max: 13,
                step: 1,
                min: 1,
                listed: false,
              },
            },
            cable: {
              type: 'Number',
              options: {
                value: 1,
                max: 16,
                step: 1,
                min: 1,
                listed: false,
              },
            },
          },
        },
      ],
    ])
  )

  const shapes = useModuleShapes()
  const device = useDevice()
  indexSearch(Array.from(items.value.keys()))

  // Getters
  const get = (id: Id) => {
    const item = items.value.get(id)
    if (!item) {
      console.warn(`module definition '${id}' not found`)
      return
    }
    return item
  }

  const getConnector = (id: Id, index: number, direction: 'in' | 'out') => {
    const item = get(id)
    if (!item) return

    const moduleConnector =
      direction === 'in' ? item.inputs[index] : item.outputs[index]
    if (!moduleConnector) {
      const name = `${direction === 'in' ? 'input' : 'output'} #${index}`
      console.warn(`${name} not found in module definition '${item.id}'`)
      return
    }

    const shapeConnector = shapes.getConnector(item.shape, index, direction)
    if (!shapeConnector) return

    return { ...moduleConnector, ...shapeConnector }
  }

  const getDefaultProps = (id: Id) => {
    const item = get(id)
    if (!item) return

    return Object.fromEntries(
      Object.entries(item.props).map(([name, { options }]) => [
        name,
        options.value,
      ])
    )
  }

  // Actions
  const search = (query: string): ModuleDefinition[] =>
    fuse?.search(query).map(({ item: id }) => items.value.get(id)!) ?? []

  const deserialize = (serialized: ModuleDefinitionSerialized[]) => {
    for (const serializedDefinition of serialized) {
      // prettier-ignore
      const {
        shape, id, label, clipContent, showLabel, inputs, outputs, props = {}
      } = serializedDefinition

      items.value.set(id, {
        id,
        inputs: inputs?.map((signal) => ({ signal })) ?? [],
        outputs: outputs?.map((signal) => ({ signal })) ?? [],
        shape: shape ?? id,
        label: label ?? id,
        clipContent: clipContent ?? true,
        showLabel: showLabel ?? true,
        props: Object.fromEntries(
          Object.entries(props).map(([name, [type, options]]) => [
            name,
            { type, options },
          ])
        ),
      })
    }
    // TODO: remove once its not needed anymore.
    // console.log(JSON.stringify(Array.from(items.value.entries()), null, 2))
  }

  const loadAllFromDevice = async () => {
    const result = await device.request('/e/modules/definitions')
    if (!result) return

    items.value.clear()
    deserialize(<ModuleDefinitionSerialized[]>luaToJson(result))
    indexSearch(Array.from(items.value.keys()))
  }

  const loadFromDevice = async (moduleName: string) => {
    const result = await device.request('/e/modules/definition', [moduleName])
    if (!result) return
    deserialize([luaToJson(result)])
    indexSearch(Array.from(items.value.keys()))
  }

  return {
    items,
    get,
    getConnector,
    getDefaultProps,
    search,
    loadFromDevice,
    loadAllFromDevice,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(
    acceptHMRUpdate(useModuleDefinitions as any, import.meta.hot)
  )
