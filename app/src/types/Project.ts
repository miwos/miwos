import type { ConnectionSerialized } from './Connection'
import type { ItemSerialized } from './Item'
import type { MappingPageSerialized } from './Mapping'
import type { ModulationSerialized } from './Modulation'

export interface ProjectSerialized {
  items: ItemSerialized[]
  connections: ConnectionSerialized[]
  mappings: Record<number, MappingPageSerialized>
  modulations: ModulationSerialized[]
}
