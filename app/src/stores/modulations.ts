import type {
  Modulation,
  ModulationSerialized,
  Modulator,
  Optional,
} from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'

type Id = Modulation['id']

export const useModulations = defineStore('modulations', () => {
  const map = ref(new Map<Id, Modulation>())

  const device = useDevice()

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
      ({ modulatorId, itemId: moduleId, prop, amount }) => [
        modulatorId,
        moduleId,
        prop,
        amount,
      ],
    )

  const deserialize = (serialized: ModulationSerialized[]) => {
    map.value.clear()
    serialized.forEach(([modulatorId, moduleId, prop, amount]) =>
      add({ modulatorId, itemId: moduleId, prop, amount }),
    )
  }

  const add = (modulation: Optional<Modulation, 'id'>, updateDevice = true) => {
    console.log('update device')
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
      const { modulatorId, itemId: moduleId, prop } = modulation
      device.update('/r/modulations/remove', [modulatorId, moduleId, prop])
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
      const { modulatorId, itemId: moduleId, prop } = modulation
      device.update('/r/modulations/amount', [
        modulatorId,
        moduleId,
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
