import { useBridge } from '@/bridge'
import type { ProjectSerialized } from '@/types'
import { debounce, jsonToLua, luaToJson } from '@/utils'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useConnections } from './connections'
import { useDevice } from './device'
import { useMappings } from './mappings'
import { useModulations } from './modulations'
import { useItems } from './items'

export const useProject = defineStore('project', () => {
  const partIndex = ref(0)
  const name = ref('test')
  const isSelecting = ref(false)

  // TODO: remove, now handled by items store
  // `modules` and `modulators` share the same unique id space (there will never
  // be a module and a modulator with the same id), so we can apply a modulation
  // to either a module's or a modulator's prop by just using the id and prop
  // name. `nextId` acts as a source of new ids for both to prevent id clashing.
  const nextItemId = ref(1)

  const bridge = useBridge()
  const device = useDevice()
  const items = useItems()
  const connections = useConnections()
  const mappings = useMappings()
  const modulations = useModulations()

  const folder = computed(() => `lua/projects/${name.value}`)
  const file = computed(() => `${folder.value}/part-${partIndex.value + 1}.lua`)

  bridge.on('/r/parts/select', ({ args: [index] }) => selectPart(index, false))

  bridge.on('/r/project/open', ({ args: [projectName] }) => {
    name.value = projectName
    partIndex.value = 0
    load()
  })

  // Actions
  const serialize = (): ProjectSerialized => ({
    connections: connections.serialize(),
    items: items.serialize(),
    mappings: mappings.serialize(),
    modulations: modulations.serialize(),
  })

  const save = debounce(() => {
    if (!device.isConnected) return
    const content = jsonToLua(serialize())
    return bridge.writeFile(file.value, content)
  }, 1000)

  const load = async () => {
    if (!device.isConnected) return
    const content = await bridge.readFile(file.value)
    const serialized = luaToJson(content) as ProjectSerialized
    items.deserialize(serialized.items)
    connections.deserialize(serialized.connections)
    mappings.deserialize(serialized.mappings)
    modulations.deserialize(serialized.modulations)
  }

  const clear = (updateDevice = true) => {
    connections.clear()
    mappings.clear()
    modulations.clear()
    items.clear()
    nextItemId.value = 1
    if (updateDevice) device.update('/r/project/clear')
  }

  const selectPart = (index: number, updateDevice = true) => {
    partIndex.value = index
    if (updateDevice) device.update('/r/parts/select', [index])
  }

  return {
    name,
    partIndex,
    nextItemId,
    isSelecting,
    serialize,
    save,
    load,
    clear,
    selectPart,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProject as any, import.meta.hot))
