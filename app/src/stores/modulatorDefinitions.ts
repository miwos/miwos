import type { ModulatorDefinition } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

type Id = ModulatorDefinition['id']

export const useModulatorDefinitions = defineStore(
  'modulator definitions',
  () => {
    const items = ref(
      new Map<Id, ModulatorDefinition>([
        [
          'Lfo',
          {
            id: 'Lfo',
            props: {
              shape: {
                type: 'Number',
                options: {
                  value: 1,
                  min: 1,
                  max: 1,
                  step: 1,
                },
              },
            },
          },
        ],
      ])
    )

    // Getters
    const get = (id: Id) => {
      const item = items.value.get(id)
      if (!item) {
        console.warn(`module definition '${id}' not found`)
        return
      }
      return item
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
    const serialize = () => {}

    return { items, get, getDefaultProps }
  }
)
