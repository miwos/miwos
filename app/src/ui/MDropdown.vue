<template>
  <div class="m-dropdown" :data-theme="theme ?? 'default'">
    <button
      class="m-dropdown-current-option"
      ref="currentOptionSlot"
      aria-haspopup="listbox"
      :aria-expanded="isExpanded ? 'true' : 'false'"
      :aria-label="label"
      @click="expand"
    >
      <slot name="currentOption" v-if="currentOption" v-bind="currentOption">{{
        currentOption
      }}</slot>
    </button>
    <MSelect
      v-if="isExpanded"
      ref="select"
      class="m-dropdown-list"
      :style="{ top: `${selectTop}px` }"
      :options="options"
      :value="value"
      :theme="theme"
      :autoFocus="true"
      @update:value="selectValue"
      @blur="collapse"
    >
      <template #option="option">
        <slot name="option" v-bind="option"></slot>
      </template>
    </MSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import MSelect from './MSelect.vue'

const props = defineProps<{
  value?: any
  options: { id: any; label?: string }[]
  theme?: 'default' | 'none'
  label?: string
  preferredAlignment?: 'above' | 'below'
}>()

const emit = defineEmits<{ (e: 'update:value', id: any): void }>()

const select = ref<InstanceType<typeof MSelect>>()
const currentOptionSlot = ref<HTMLElement>()
const isExpanded = ref(false)
const selectTop = ref(0)
const currentOption = computed(() =>
  [...props.options].find((v) => v.id === props.value)
)

const expand = async () => {
  isExpanded.value = true
  await nextTick()
  if (select.value && currentOptionSlot.value) {
    const { height } = select.value.$el.getBoundingClientRect()
    const { top, bottom } = currentOptionSlot.value.getBoundingClientRect()

    const isPreferredAbove = props.preferredAlignment === 'above'
    const above = top - height
    const below = bottom
    const absolutePosition = isPreferredAbove
      ? above >= 0
        ? above
        : below
      : below + height <= window.innerHeight
      ? below
      : above

    selectTop.value = absolutePosition - top // Relative position
  }
}

const collapse = () => (isExpanded.value = false)

const selectValue = (value: any) => {
  emit('update:value', value)
  collapse()
}
</script>

<style lang="scss" scoped>
.m-dropdown {
  position: relative;
  white-space: nowrap;

  &-list {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  &-current-option {
    display: block;
    cursor: pointer;
  }
}

.m-dropdown[data-theme='default'] {
  --m-select-color-bg: var(--color-glass-solid);
  --m-select-color-focus: var(--color-glass-dark-solid);
}
</style>
