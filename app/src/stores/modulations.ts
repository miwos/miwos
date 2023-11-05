import type {
  Modulation,
  ModulationSerialized,
  Modulator,
  Optional,
} from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'
import { useBridge } from '@/bridge'
import { map as mapValue, unpackBytes } from '@/utils'
import { useEventBus } from '@vueuse/core'
import { useItems } from './items'

type Id = Modulation['id']

export const useModulations = defineStore('modulations', () => {
  const map = ref(new Map<Id, Modulation>())

  const device = useDevice()
  const bridge = useBridge()
  const items = useItems()

  const modulatorValueBus = useEventBus('modulator-value')
  bridge.on('/n/modulations/update', ({ args }) => {
    for (let i = 0; i < args.length; i += 2) {
      const info = args[i]
      const value = args[i + 1]

      const type = info & 0xff
      if (type === 0) {
        const [, modulatorId] = unpackBytes(info)
        modulatorValueBus.emit(modulatorId, value)
      } else if (type === 1) {
        const [, itemId, propIndex] = unpackBytes(info)
        const item = items.instances.get(itemId)
        if (!item) continue

        const definition = items.definitions.get(item.type)
        if (!definition) continue

        const propName = Object.keys(definition.props).find(
          (name) => definition.props[name].options.index === propIndex,
        )
        if (!propName) continue

        item.modulatedProps[propName] = value
      }
    }
  })

  // Getters
  const getByProp = (itemId: number, prop: string) =>
    computed(() =>
      Array.from(map.value.values()).find(
        (item) => item.itemId === itemId && item.prop === prop,
      ),
    )

  const list = computed(() => Array.from(map.value.values()))

  const getByItemId = (id: number) =>
    computed(() => list.value.filter(({ itemId }) => itemId === id))

  // Todo: make this computed as well
  const getByModulatorId = (id: Modulator['id']) =>
    list.value.filter((item) => item.modulatorId === id)

  // Actions
  const serialize = (): ModulationSerialized[] =>
    Array.from(map.value.values()).map(
      ({ modulatorId, itemId, prop, amount }) => [
        modulatorId,
        itemId,
        prop,
        amount,
      ],
    )

  const deserialize = (serialized: ModulationSerialized[]) => {
    map.value.clear()
    serialized.forEach(([modulatorId, itemId, prop, amount]) =>
      add({ modulatorId, itemId, prop, amount }),
    )
  }

  const add = (modulation: Optional<Modulation, 'id'>, updateDevice = true) => {
    modulation.id ??= `${modulation.itemId}-${modulation.prop}`
    map.value.set(modulation.id, modulation as Modulation)

    if (updateDevice) {
      device.update('/r/modulations/add', [
        modulation.modulatorId,
        modulation.itemId,
        modulation.prop,
        modulation.amount,
      ])
    }
  }

  const remove = (id: Id, updateDevice = true) => {
    const modulation = map.value.get(id)
    if (!modulation) return

    map.value.delete(id)

    if (updateDevice) {
      const { modulatorId, itemId, prop } = modulation
      device.update('/r/modulations/remove', [modulatorId, itemId, prop])
    }
  }

  const updateAmount = (
    id: Id,
    amount: Modulation['amount'],
    updateDevice = true,
  ) => {
    const modulation = map.value.get(id)
    if (!modulation) return

    modulation.amount = amount
    if (updateDevice) {
      const { modulatorId, itemId, prop } = modulation
      device.update('/r/modulations/amount', [
        modulatorId,
        itemId,
        prop,
        amount,
      ])
    }
  }

  const clear = () => map.value.clear()

  return {
    map,
    getByProp,
    getByItemId,
    getByModulatorId,
    serialize,
    deserialize,
    add,
    remove,
    updateAmount,
    clear,
  }
})
