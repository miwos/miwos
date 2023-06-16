import { useBridge } from '@/bridge'
import type { ProjectSerialized } from '@/types'
import { debounce, jsonToLua, luaToJson } from '@/utils'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useConnections } from './connections'
import { useDevice } from './device'
import { useMappings } from './mappings'
import { useModules } from './modules'
import { useModulators } from './modulators'
import { useModulations } from './modulations'

export const useProject = defineStore('project', () => {
  const partIndex = ref(0)
  const name = ref('test')
  const isSelecting = ref(false)
  // `modules` and `modulators` share the same unique id space (there will never
  // be a module and a modulator with the same id), so we can apply a modulation
  // to either a module's or a modulator's prop by just using the id and prop
  // name. `nextId` acts as a source of new ids for both to prevent id clashing.
  const nextId = ref(1)

  const bridge = useBridge()
  const device = useDevice()
  const connections = useConnections()
  const modules = useModules()
  const mappings = useMappings()
  const modulators = useModulators()
  const modulations = useModulations()

  const folder = computed(() => `lua/projects/${name.value}`)
  const file = computed(() => `${folder.value}/part-${partIndex.value + 1}.lua`)

  bridge.on('/e/parts/select', ({ args: [index] }) => selectPart(index, false))

  bridge.on('/e/project/open', ({ args: [projectName] }) => {
    name.value = projectName
    partIndex.value = 0
    load()
  })

  // Actions
  const serialize = (): ProjectSerialized => ({
    connections: connections.serialize(),
    modules: modules.serialize(),
    mappings: mappings.serialize(),
    modulators: modulators.serialize(),
    modulations: modulations.serialize(),
  })

  const save = debounce(() => {
    // console.log('save disabled')
    if (!device.isConnected) return
    const content = jsonToLua(serialize())
    console.log(content)
    return bridge.writeFile(file.value, content)
  }, 1000)

  const load = async () => {
    if (!device.isConnected) return
    const content = await bridge.readFile(file.value)
    console.log(content)
    const serialized = luaToJson(content) as ProjectSerialized
    modules.deserialize(serialized.modules)
    connections.deserialize(serialized.connections)
    mappings.deserialize(serialized.mappings)
    modulators.deserialize(serialized.modulators)
    modulations.deserialize(serialized.modulations)
  }

  const clear = (updateDevice = true) => {
    connections.clear()
    modules.clear()
    mappings.clear()
    modulations.clear()
    modulators.clear()
    nextId.value = 1
    if (updateDevice) device.update('/e/patch/clear')
  }

  const selectPart = (index: number, updateDevice = true) => {
    partIndex.value = index
    if (updateDevice) device.update('/e/parts/select', [index])
  }

  return {
    name,
    partIndex,
    nextId,
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
