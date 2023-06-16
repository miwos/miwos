<template>
  <div
    class="module-prop"
    :class="[`side-${side}`]"
    :style="{
      'z-index': contextIsVisible ? 1 : undefined,
      top: props.position.y + 'px',
      left: props.position.x + 'px',
    }"
    ref="el"
  >
    <button
      class="module-prop-handle"
      :data-status="handleStatus"
      @click="showContext"
    ></button>
    <div class="module-prop-content" ref="content">
      <button
        v-if="nameIsVisible"
        ref="name"
        class="module-prop-name"
        @click="showField"
        @focus="showField"
      >
        {{ props.name }}
      </button>
      <component
        v-if="fieldIsVisible"
        :is="components[type] ?? Number"
        v-bind="options"
        :value="value"
        ref="field"
        class="module-prop-field glass"
        @update:value="emit('update:value', $event)"
        @blur="hideField"
      />
    </div>
    <Teleport to="body">
      <div v-if="contextIsVisible" ref="context" class="module-prop-context">
        <MappingSelect
          class="module-prop-mapping"
          :value="mapping?.slot"
          @update:value="setMapping"
        />
        <ModulateAmount
          v-if="amountIsVisible"
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

<script setup lang="ts">
import { onMouseDownOutside } from '@/composables/onMouseDownOutside'
import { onMouseUpOutside } from '@/composables/onMouseUpOutside'
import { useApp } from '@/stores/app'
import { useMappings } from '@/stores/mappings'
import type { Module, Point } from '@/types'
import Number from '@/ui/MNumber.vue'
import { computed, nextTick, ref, type Component } from 'vue'
import MappingSelect from './MappingSelect.vue'
import ModulateSelect from './ModulateSelect.vue'
import { useModulations } from '@/stores/modulations'
import ModulateAmount from './ModulateAmount.vue'

const props = defineProps<{
  name: string
  // TODO: change back to `Module[id]`, props of type number
  // are somehow broken
  moduleId: any
  type: string
  value: unknown
  options: any
  position: Point
  side: 'left' | 'right'
}>()

const emit = defineEmits<{ (e: 'update:value', value: unknown): void }>()

const components: Record<string, Component> = { Number }

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

const mapping = mappings.getMapping(props.moduleId, props.name)
const modulation = modulations.getByModuleProp(props.moduleId, props.name)
const isMappedOnCurrentPage = computed(
  () => mapping.value?.pageIndex === mappings.pageIndex
)

const name = ref<HTMLElement>()
const nameIsVisible = computed(
  () => app.showPropFields || !fieldIsVisible.value
)

const handleStatus = computed(() =>
  isMappedOnCurrentPage.value && modulation.value
    ? 'mapped-and-modulated'
    : isMappedOnCurrentPage.value
    ? 'mapped'
    : modulation.value
    ? 'modulated'
    : 'mapped-inactive'
)

const showField = async () => {
  if (app.showPropFields) return
  fieldIsVisible.value = true
  await nextTick()
  field.value?.focus()
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
  const { moduleId, name: prop } = props

  if (slot === undefined) {
    const mapping = mappings.getMapping(moduleId, prop).value
    mapping && mappings.remove(mappings.pageIndex, mapping.slot)
  } else {
    mappings.add(mappings.pageIndex, { slot, moduleId, prop })
  }

  hideContext()
}

const setModulation = (modulatorId: number | undefined) => {
  const { moduleId, name: prop } = props

  if (modulatorId === undefined) {
    modulation.value && modulations.remove(modulation.value.id)
  } else {
    modulations.add({ modulatorId, moduleId, prop, amount: 0.5 })
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

<style scoped lang="scss">
.module-prop {
  position: absolute;
  transform: translateY(-50%);
  gap: 0.5em;
  height: 2em;
  display: flex;
  align-items: center;

  &.side-left {
    transform: translate(-100%, -50%);
    flex-direction: row-reverse;
  }

  &-handle {
    display: block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    box-sizing: border-box;
    background-color: var(--color-module-bg);
    cursor: pointer;
    transition: fill var(--fade-duration);

    .mapping-modal &,
    &[data-status='mapped'] {
      background: var(--color-mapping);
    }

    &[data-status='mapped-inactive'] {
      // A bit darker than the glass color.
      background-color: hsl(0deg 0% 29%);
    }

    &[data-status='modulated'] {
      background: var(--color-modulation);
    }

    &[data-status='mapped-and-modulated'] {
      background: linear-gradient(
        90deg,
        var(--color-mapping) 50%,
        var(--color-modulation) 50%
      );
    }
  }

  &-content {
    position: relative;
  }

  &-name {
    font-family: 'Vevey Positive';
    font-size: 16px;
    text-transform: capitalize;
    white-space: nowrap;
    cursor: pointer;
  }

  &-field {
    display: flex;
    border-radius: var(--radius-xs);
    width: 6em;
    height: 1.5em;
    padding: 0 0.3em;
    box-sizing: border-box;
    font-weight: 300;
  }

  &-context {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    top: v-bind('contextPosition.y + `px`');
    left: v-bind('contextPosition.x + `px`');
  }
}
</style>
