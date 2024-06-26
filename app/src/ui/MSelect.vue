<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { onMounted, onUnmounted, ref, toRefs, watch } from 'vue'

const emit = defineEmits<{ (e: 'update:value', id: any): void }>()

const props = defineProps<{
  value?: any
  options: { id: any; label?: string }[]
  theme?: 'default' | 'none'
  autoFocus?: boolean
  label?: string
  showUnset?: boolean
}>()

const el = ref<HTMLElement>()
const { options } = toRefs(props)
const focusedIndex = ref(0)
const bounds = useElementBounding(el, { windowScroll: false })

onMounted(() => {
  if (props.autoFocus) el.value?.focus()
  if (props.value !== undefined) {
    const index = props.options.findIndex((v) => v.id === props.value)
    focus(index)
  }
})

watch(options, () => (focusedIndex.value = 0))

const focus = (index: number) => {
  const { length } = options.value
  focusedIndex.value = index < 0 ? length - 1 : index >= length ? 0 : index
  scrollOptionIntoView(focusedIndex.value)
}

const scrollOptionIntoView = (index: number) => {
  const option = el.value?.children[index] as HTMLElement
  if (!option) return

  const { top, bottom } = option.getBoundingClientRect()
  if (bottom > bounds.bottom.value) {
    option.scrollIntoView({ block: 'end' })
  } else if (top < bounds.top.value) {
    option.scrollIntoView({ block: 'start' })
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  const { key } = e
  if (key === 'ArrowUp') {
    e.preventDefault()
    focus(focusedIndex.value - 1)
  } else if (key === 'ArrowDown') {
    e.preventDefault()
    focus(focusedIndex.value + 1)
  } else if (key === 'Enter') {
    e.preventDefault()
    emit('update:value', options.value[focusedIndex.value]?.id)
  } else if (key === 'PageUp' || key === 'Home') {
    e.preventDefault()
    focus(0)
  } else if (key === 'PageDown' || key === 'End') {
    e.preventDefault()
    focus(options.value.length - 1)
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <ul
    ref="el"
    class="select"
    :data-show-unset="showUnset"
    :data-theme="theme ?? 'default'"
    :data-single-option="options.length === 1"
    role="listbox"
    :aria-label="label"
    tabindex="0"
  >
    <li
      v-for="(option, index) in props.options"
      :key="option.id"
      class="option"
      :class="{ focused: index === focusedIndex }"
      role="option"
      :aria-selected="props.value === option.id"
      @click.stop="emit('update:value', option.id)"
      @mouseenter="focus(index)"
    >
      <slot name="option" v-bind="option" :isFocused="index === focusedIndex">
        {{ option.label }}
      </slot>
      <button
        v-if="showUnset && option.id === value"
        class="unset"
        @click.stop="emit('update:value', undefined)"
      >
        <svg viewBox="0 0 10 10" class="icon">
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.select {
  position: relative;
  margin: 0;
  padding-left: 0;
  list-style: none;

  ::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
    background: var(--glass-color-solid);
  }
  ::-webkit-scrollbar-track {
    -webkit-border-radius: 10px;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: var(--glass-color-darker-solid);
  }
}

.option {
  cursor: pointer;
}

.select[data-theme='default'] {
  --radius: var(--radius-s);
  border-radius: var(--radius);
  background-color: var(--m-select-color-bg);
  white-space: nowrap;

  .option {
    display: flex;
    align-items: center;
    height: 23px;
    padding: 0 var(--radius);
    gap: 0.2em;
    cursor: pointer;

    &:first-child {
      border-radius: var(--radius) var(--radius) 0 0;
    }

    &:last-child {
      border-radius: 0 0 var(--radius) var(--radius);
    }

    &.focused:not(:last-child, :first-child) {
      margin: -1px 0;
      padding-top: 1px;
      padding-bottom: 1px;
    }

    &.focused {
      background-color: var(--m-select-color-focus);
    }
  }

  &[data-single-option='true'] .option {
    border-radius: var(--radius);
  }

  &[data-show-unset='true'] .option[aria-selected='true'] {
    /* Add a little space for the unset button. */
    padding-right: calc(var(--radius) + 0.1rem);
  }

  .unset {
    --bg: #d9d9d9;
    --color: black;
    box-sizing: border-box;

    position: absolute;
    right: 0;
    width: 0.85rem;
    height: 0.85rem;
    padding: 4px;
    transform: translateX(55%);
    border-radius: 100%;
    background-color: var(--bg);

    &:hover {
      --bg: var(--color-glass-dark-solid);
      --color: white;
    }

    svg {
      display: block;
      stroke: var(--color);
      stroke-width: 1px;
      overflow: visible;
      stroke-linecap: round;
      line {
        vector-effect: non-scaling-stroke;
      }
    }
  }
}
</style>
