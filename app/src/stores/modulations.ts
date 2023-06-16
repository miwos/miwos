import type {
  Modulation,
  ModulationSerialized,
  Modulator,
  Module,
  Optional,
} from '@/types'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { ref } from 'vue'
import { useDevice } from './device'

type Id = Modulation['id']

const modulationsAreEqual = (
  a: Omit<Modulation, 'amount' | 'id'>,
  b: Omit<Modulation, 'amount' | 'id'>
) => a.moduleId === b.moduleId && a.prop === b.prop

export const useModulations = defineStore('modulations', () => {
  const items = ref(new Map<Id, Modulation>())

  const device = useDevice()

  // Getters
  const getByModuleProp = (moduleId: Module['id'], prop: string) =>
    computed(() =>
      Array.from(items.value.values()).find(
        (item) => item.moduleId === moduleId && item.prop === prop
      )
    )

  const list = computed(() => Array.from(items.value.values()))

  const getByModulatorId = (id: Modulator['id']) =>
    list.value.filter((item) => item.modulatorId === id)

  // Actions
  const serialize = (): ModulationSerialized[] =>
    Array.from(items.value.values()).map(
      ({ modulatorId, moduleId, prop, amount }) => [
        modulatorId,
        moduleId,
        prop,
        amount,
      ]
    )

  const deserialize = (serialized: ModulationSerialized[]) => {
    items.value.clear()
    serialized.forEach(([modulatorId, moduleId, prop, amount]) =>
      add({ modulatorId, moduleId, prop, amount })
    )
  }

  const add = (modulation: Optional<Modulation, 'id'>, updateDevice = true) => {
    console.log('update device')
    modulation.id ??= `${modulation.moduleId}-${modulation.prop}`
    items.value.set(modulation.id, modulation as Modulation)

    if (updateDevice) {
      device.update('/e/modulations/add', [
        modulation.modulatorId,
        modulation.moduleId,
        modulation.prop,
        modulation.amount,
      ])
    }
  }

  const remove = (id: Id, updateDevice = false) => {
    const modulation = items.value.get(id)
    if (!modulation) return

    items.value.delete(id)

    if (updateDevice) {
      const { modulatorId, moduleId, prop } = modulation
      device.update('/e/modulations/remove', [modulatorId, moduleId, prop])
    }
  }

  const updateAmount = (
    id: Id,
    amount: Modulation['amount'],
    updateDevice = true
  ) => {
    const modulation = items.value.get(id)
    if (!modulation) return

    modulation.amount = amount
    if (updateDevice) {
      const { modulatorId, moduleId, prop } = modulation
      device.update('/e/modulations/amount', [
        modulatorId,
        moduleId,
        prop,
        amount,
      ])
    }
  }

  const clear = () => items.value.clear()

  return {
    items,
    getByModuleProp,
    getByModulatorId,
    serialize,
    deserialize,
    add,
    remove,
    updateAmount,
    clear,
  }
})
