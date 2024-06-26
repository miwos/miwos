<script setup lang="ts">
import { onMouseDownOutside } from '@/composables/onMouseDownOutside'
import { onMouseUpOutside } from '@/composables/onMouseUpOutside'
import { useApp } from '@/stores/app'
import { useMappings } from '@/stores/mappings'
import { useModulations } from '@/stores/modulations'
import Number from '@/ui/MNumber.vue'
import Button from './PropButton.vue'
import { computed, nextTick, ref, type Component } from 'vue'
import MappingSelect from './MappingSelect.vue'
import ModulateAmount from './ModulateAmount.vue'
import ModulateSelect from './ModulateSelect.vue'
import ItemPropHandle from './ItemPropHandle.vue'

const props = defineProps<{
  name: string
  itemId: any
  type: string
  value: unknown
  options: any
}>()

const emit = defineEmits<{ (e: 'update:value', value: unknown): void }>()

const components: Record<string, Component> = { Number, Button }

const app = useApp()
const el = ref<HTMLElement>()
const content = ref<HTMLElement>()

const field = ref<HTMLElement>()
const fieldIsVisible = ref(false)

const mappings = useMappings()
const modulations = useModulations()
const context = ref<HTMLElement>()
const contextIsVisible = ref(false)
const contextPosition = ref({ x: 0, y: 0 })
const amountIsVisible = ref(false)

const mapping = mappings.getMapping(props.itemId, props.name)
const modulation = modulations.getByProp(props.itemId, props.name)
const isMappedOnCurrentPage = computed(
  () => mapping.value?.pageIndex === mappings.pageIndex,
)

const label = ref<HTMLElement>()
const nameIsVisible = computed(
  () => app.showPropFields || !fieldIsVisible.value,
)

const handleStatus = computed(() =>
  isMappedOnCurrentPage.value && modulation.value
    ? 'mapped-and-modulated'
    : isMappedOnCurrentPage.value
      ? 'mapped'
      : modulation.value
        ? 'modulated'
        : mapping.value
          ? 'mapped-other-page'
          : 'none',
)

const showField = async () => {
  if (app.showPropFields) return
  fieldIsVisible.value = true
  await nextTick()
  field.value?.focus?.()
}

const hideField = () => {
  if (app.showPropFields) return
  fieldIsVisible.value = false
}

let activeElement: Element | null
const showContext = () => {
  // The mapping select is teleported and thereby breaking the tab flow. To let
  // the user continue where we left off before the mapping dialog we store the
  // currently focused element and restore it in `hideMapping()`.
  activeElement = document.activeElement
  const { top = 0, left = 0 } = content.value?.getBoundingClientRect() ?? {}
  contextPosition.value = { x: left, y: top }
  contextIsVisible.value = app.isMapping = true
  amountIsVisible.value = false
}

const hideContext = () => {
  contextIsVisible.value = app.isMapping = false
  window.setTimeout(() => (activeElement as HTMLElement)?.focus())
}

const setMapping = (slot: number | undefined) => {
  const { itemId, name: prop } = props

  if (slot === undefined) {
    const mapping = mappings.getMapping(itemId, prop).value
    mapping && mappings.remove(mappings.pageIndex, mapping.slot)
  } else {
    const page = mappings.pageIndex
    mappings.add(mappings.pageIndex, { page, slot, itemId, prop })
  }

  hideContext()
}

const setModulation = (modulatorId: number | undefined) => {
  const { itemId, name: prop } = props

  if (modulatorId === undefined) {
    modulation.value && modulations.remove(modulation.value.id)
  } else if (!modulation.value) {
    modulations.add({ modulatorId, itemId, prop, amount: 0.5 })
  }

  amountIsVisible.value = true
}

const updateModulationAmount = (amount: number) => {
  if (!modulation.value) return
  modulations.updateAmount(modulation.value.id, amount)
}

onMouseUpOutside(el, hideField)
onMouseDownOutside(context, hideContext)
</script>

<template>
  <div ref="el" class="item-prop">
    <ItemPropHandle :status="handleStatus" @click="showContext" />
    <div ref="content" class="content">
      <button
        v-if="nameIsVisible"
        ref="label"
        class="label"
        @click="showField"
        @focus="showField"
      >
        {{ props.name }}
      </button>
      <component
        v-if="fieldIsVisible"
        :is="components[type] ?? Number"
        ref="field"
        v-bind="options"
        :name="name"
        :value="value"
        class="item-prop-field glass"
        @update:value="emit('update:value', $event)"
        @blur="hideField"
      />
    </div>
    <Teleport to="body">
      <div v-if="contextIsVisible" ref="context" class="context">
        <MappingSelect
          class="mapping"
          :value="mapping?.slot"
          @update:value="setMapping"
        />
        <ModulateAmount
          v-if="amountIsVisible && modulation"
          :value="modulation?.amount"
          :modulation="modulation"
          @update:value="updateModulationAmount"
        />
        <ModulateSelect
          v-else
          :value="modulation?.modulatorId"
          @update:value="setModulation"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.item-prop {
  display: flex;
  align-items: center;
  height: 2em;
  gap: 0.5em;
}

.content {
  position: relative;
}

.label {
  font-size: 16px;
  font-family: 'Vevey Positive';
  text-transform: capitalize;
  white-space: nowrap;
  cursor: pointer;
}

.context {
  display: flex;
  position: absolute;
  top: v-bind('contextPosition.y + `px`');
  left: v-bind('contextPosition.x + `px`');
  flex-direction: column;
  gap: 0.5rem;
}
</style>
