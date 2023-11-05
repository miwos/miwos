import type {
  Mapping,
  MappingPage,
  MappingPageSerialized,
} from '@/types/Mapping'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDevice } from './device'
import { useBridge } from '@/bridge'

const mappingsEqual = (
  a: Pick<Mapping, 'itemId' | 'prop'>,
  b: Pick<Mapping, 'itemId' | 'prop'>,
) => a.itemId === b.itemId && a.prop === b.prop

export const useMappings = defineStore('mappings', () => {
  const pages = ref(new Map<number, MappingPage>())
  const pageIndex = ref(0)

  const device = useDevice()
  const bridge = useBridge()

  bridge.on('/n/pages/select', ({ args: [index] }) => (pageIndex.value = index))

  const currentPage = computed(() => pages.value.get(pageIndex.value))
  const currentPageList = computed(
    () => currentPage.value && Array.from(currentPage.value?.values()),
  )

  // ? use `currentPage` instead?
  const getCurrentPage = () => pages.value.get(pageIndex.value)

  const getMapping = (itemId: number, prop: string) =>
    computed(() => {
      for (const [index, page] of pages.value.entries()) {
        for (const mapping of page.values()) {
          if (mappingsEqual(mapping, { itemId, prop }))
            return { ...mapping, pageIndex: index }
        }
      }
    })

  const getByItemId = (id: number) =>
    computed(() => {
      const result = []
      for (const page of pages.value.values()) {
        for (const mapping of page.values()) {
          if (mapping.itemId === id) {
            result.push(mapping)
          }
        }
      }
      return result
    })

  const getOnCurrentPageByItemId = (id: number) =>
    computed(
      () =>
        currentPageList.value?.filter((mapping) => mapping.itemId === id) ?? [],
    )

  // Actions
  const serialize = (): Record<number, MappingPageSerialized> => {
    const serialized: Record<number, MappingPageSerialized> = {}
    for (const [index, page] of pages.value.entries()) {
      const luaIndex = index + 1 // use one-based index
      serialized[luaIndex] = {}
      for (const [slot, { itemId, prop }] of page.entries()) {
        const luaSlot = slot + 1 // use one-based index
        serialized[luaIndex][luaSlot] = [itemId, prop]
      }
    }
    return serialized
  }

  const deserialize = (serialized: Record<number, MappingPageSerialized>) => {
    pages.value.clear()
    for (const [luaPage, pageSerialized] of Object.entries(serialized)) {
      const pageIndex = (+luaPage - 1) as number // use zero-based index
      const page = new Map() as MappingPage
      for (const [luaSlot, mappingSerialized] of Object.entries(
        pageSerialized,
      )) {
        const slotIndex = +luaSlot - 1 // use zero-based index
        const [itemId, prop] = mappingSerialized
        const mapping = { page: pageIndex, slot: +slotIndex, itemId, prop }
        page.set(slotIndex, mapping)
      }
      pages.value.set(pageIndex, page)
    }
  }

  const selectPage = (index: number, updateDevice = true) => {
    pageIndex.value = index
    if (updateDevice) device.notify('/n/pages/select', [index + 1]) // one-based index
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
      device.update('/r/mappings/add', [
        pageIndex + 1,
        mapping.slot + 1,
        mapping.itemId,
        mapping.prop,
      ])
    }
  }

  const remove = (pageIndex: number, slot: number, updateDevice = true) => {
    const page = pages.value.get(pageIndex)
    if (!page) return

    page.delete(slot)
    if (!page.size) pages.value.delete(pageIndex)

    if (updateDevice)
      // use one-based indexes
      device.update('/r/mappings/remove', [pageIndex + 1, slot + 1])
  }

  const clear = () => {
    pageIndex.value = 0
    pages.value.clear()
  }

  return {
    pages,
    pageIndex,
    getCurrentPage,
    getMapping,
    getByItemId,
    getOnCurrentPageByItemId,
    serialize,
    deserialize,
    selectPage,
    add,
    remove,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMappings as any, import.meta.hot))
