import type { Modulator, ModulatorSerialized, Optional } from '@/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'
import { useModulatorDefinitions } from './modulatorDefinitions'
import { useProject } from './project'
import { useBridge } from '@/bridge'
import { map, unpackBytes } from '@/utils'
import { useEventBus } from '@vueuse/core'
import { useModulations } from './modulations'

type Id = Modulator['id']

export const serializeModulator = (
  modulator: Modulator
): ModulatorSerialized => ({
  ...modulator,
  position: [modulator.position.x, modulator.position.y],
})

export const deserializeModulator = (
  serialized: ModulatorSerialized
): Modulator => ({
  ...serialized,
  label: serialized.label ?? serialized.type,
  props: serialized.props ?? {},
  position: {
    x: serialized.position?.[0] ?? 0,
    y: serialized.position?.[1] ?? 0,
  },
})

export const useModulators = defineStore('modulators', () => {
  const items = ref(
    new Map<Id, Modulator>([
      [
        1,
        {
          id: 1,
          type: 'Lfo',
          props: { shape: 1, rate: 5 },
          label: 'Lfo 1',
          position: { x: 0, y: 0 },
        },
      ],
    ])
  )

  const modulations = useModulations()
  const project = useProject()
  const device = useDevice()
  const definitions = useModulatorDefinitions()
  const bridge = useBridge()
  const modulatorValueBus = useEventBus('modulator-value')

  bridge.on('/e/modulators/values', ({ args }) => {
    for (const packed of args) {
      const [modulatorId, value] = unpackBytes(packed)
      const modulator = items.value.get(modulatorId)
      if (!modulator) continue

      const normalizedValue = map(value, 0, 255, -1, 1)
      modulatorValueBus.emit(modulatorId, normalizedValue)
    }
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

  const list = computed(() => Array.from(items.value.values()))

  // Actions
  const serialize = (): ModulatorSerialized[] =>
    Array.from(items.value.values()).map(serializeModulator)

  const deserialize = (serialized: ModulatorSerialized[]) => {
    items.value.clear()
    for (const serializedModulator of serialized) {
      const modulator = deserializeModulator(serializedModulator)
      add(modulator, false)
      // Make sure that future modulator ids won't clash with the currently
      // added modulator.
      project.nextId = Math.max(project.nextId, modulator.id + 1)
    }
  }

  const add = (
    modulator: Optional<Modulator, 'id' | 'props'>,
    updateDevice = true
  ) => {
    modulator.id ??= project.nextId++
    modulator.props ??= definitions.getDefaultProps(modulator.type)
    items.value.set(modulator.id, modulator as Modulator)

    if (updateDevice)
      device.update('/e/modulators/add', [modulator.id, modulator.type])
  }

  const remove = (id: Id, updateDevice = true) => {
    items.value.delete(id)

    modulations.getByModulatorId(id).forEach(({ id }) => modulations.remove(id))

    if (updateDevice) device.update('/e/modulators/remove', [id])
  }

  const clear = () => items.value.clear()

  return { items, list, get, serialize, deserialize, add, remove, clear }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useModulators as any, import.meta.hot))
