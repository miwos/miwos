import type { ConnectionSerialized } from './Connection'
import type { MappingPageSerialized } from './Mapping'
import type { ModulationSerialized, ModulatorSerialized } from './Modulation'
import type { ModuleSerialized } from './Module'

export interface ProjectSerialized {
  modules: ModuleSerialized[]
  modulators: ModulatorSerialized[]
  connections: ConnectionSerialized[]
  mappings: Record<number, MappingPageSerialized>
  modulations: ModulationSerialized[]
}
