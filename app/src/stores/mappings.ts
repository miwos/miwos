import type { Module } from '@/types'
import type {
  Mapping,
  MappingPage,
  MappingPageSerialized,
  MappingSerialized,
} from '@/types/Mapping'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'

const mappingsEqual = (a: Omit<Mapping, 'slot'>, b: Omit<Mapping, 'slot'>) =>
  a.moduleId === b.moduleId && a.prop === b.prop

export const useMappings = defineStore('mappings', () => {
  const pages = ref(new Map<number, MappingPage>())
  const pageIndex = ref(0)

  const device = useDevice()

  // Getters
  const getPage = (index: number) => {
    if (pages.value.has(index)) {
      return pages.value.get(index)
    } else {
      console.warn(`mapping page #${index} not found`)
    }
  }

  const getCurrentPage = () => getPage(pageIndex.value)

  const getMapping = (moduleId: Module['id'], prop: string) =>
    computed(() => {
      for (const [index, page] of pages.value.entries()) {
        for (const mapping of page.values()) {
          if (mappingsEqual(mapping, { moduleId, prop }))
            return { ...mapping, pageIndex: index }
        }
      }
    })

  // Actions
  const serialize = (): Record<number, MappingPageSerialized> => {
    const serialized: Record<number, MappingPageSerialized> = {}
    for (const [index, page] of pages.value.entries()) {
      const luaIndex = index + 1 // use one-based index
      serialized[luaIndex] = {}
      for (const [slot, { moduleId, prop }] of page.entries()) {
        const luaSlot = slot + 1 // use one-based index
        serialized[luaIndex][luaSlot] = [moduleId, prop]
      }
    }
    return serialized
  }

  const deserialize = (serialized: Record<number, MappingPageSerialized>) => {
    pages.value.clear()
    for (const [luaIndex, pageSerialized] of Object.entries(serialized)) {
      const index = (+luaIndex - 1) as number // use zero-based index
      const page = new Map() as MappingPage
      for (const [luaSlot, mappingSerialized] of Object.entries(
        pageSerialized
      )) {
        const slot = +luaSlot - 1 // use zero-based index
        const [moduleId, prop] = mappingSerialized
        const mapping = { slot: +slot, moduleId, prop }
        page.set(slot, mapping)
      }
      pages.value.set(index, page)
    }
  }

  const add = (pageIndex: number, mapping: Mapping, updateDevice = true) => {
    // Remove any previous mappings, because a module prop should only be mapped
    // once at a time.
    pages.value.forEach((page, index) => {
      for (const existingMapping of page.values()) {
        if (mappingsEqual(mapping, existingMapping))
          remove(index, existingMapping.slot)
      }
    })

    // Add missing page, as we only store pages that already have a mapping.
    let page = pages.value.get(pageIndex)
    if (!page) {
      page = new Map()
      pages.value.set(pageIndex, page)
    }

    page.set(mapping.slot, mapping)
    if (updateDevice) {
      // use one-based indexes
      device.update('/e/mappings/add', [
        pageIndex + 1,
        mapping.slot + 1,
        mapping.moduleId,
        mapping.prop,
      ])
    }
  }

  const remove = (pageIndex: number, slot: number, updateDevice = true) => {
    const page = pages.value.get(pageIndex)
    if (!page) return

    page.delete(slot)
    if (updateDevice)
      // use one-based indexes
      device.update('/e/mappings/remove', [pageIndex + 1, slot + 1])
  }

  const clear = () => {
    pageIndex.value = 0
    pages.value.clear()
  }

  return {
    pages,
    pageIndex,
    getPage,
    getCurrentPage,
    getMapping,
    serialize,
    deserialize,
    add,
    remove,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMappings as any, import.meta.hot))
