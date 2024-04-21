<template>
  <div class="module-search" :class="`align-results-${alignResults}`">
    <input
      class="module-search-input glass pill"
      ref="input"
      placeholder="Search…"
      spellcheck="false"
      :value="query"
      @input="query = ($event.target as any).value"
      @blur="emit('blur')"
    />
    <MSelect
      class="module-search-results"
      :options="results"
      theme="none"
      @update:value="emit('select', $event)"
    >
      <template #option="{ id, isFocused }">
        <div
          class="module-search-option pill"
          :class="isFocused ? 'glass-dark' : 'glass'"
        >
          {{ id }}
        </div>
      </template>
    </MSelect>
  </div>
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { ModuleDefinition } from '@/types'
import type { ItemDefinition } from '@/types/Item'
import { ref, watchEffect } from 'vue'
import MSelect from '../ui/MSelect.vue'

defineProps<{ alignResults: 'top' | 'bottom' }>()

const emit = defineEmits<{
  (e: 'select', type: ModuleDefinition['id']): void
  (e: 'blur'): void
}>()

const items = useItems()

const input = ref<HTMLInputElement>()
const results = ref<ItemDefinition[]>([])
const query = ref('')

watchEffect(() => (results.value = items.searchDefinitions(query.value)))

const focus = () => input.value?.focus()
const clear = () => (query.value = '')

defineExpose({ focus, clear })
</script>

<style>
.module-search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  /* The lightbox and the search being the only element on the page should
  provide enough focus. */
  :focus-visible {
    outline: none;
  }

  &.align-results-top {
    flex-direction: column-reverse;
  }

  /* `justify-content: flex-end` would break the auto scrollbar
  see: https://stackoverflow.com/a/37515194/12207499 */
  &.align-results-top .m-select-option:first-child {
    margin-top: auto;
  }
}

.module-search-input::placeholder {
  font-weight: 400;
  color: #a1a1a1;
}

.module-search-results {
  flex: 1;
  display: flex;
  flex-direction: column;

  gap: 0.5rem;
  margin: 0;
  margin-left: 1.5rem;

  & .m-select-list {
    gap: 0.5rem;
  }

  &.overflow {
    /* Make some space for the scrollbar */
    padding-right: 7px;
    margin-right: -15px; /* 7px (padding) + 8px (scrollbar width) */
  }
}

.module-search {
  ::-webkit-scrollbar {
    width: 8px;
    background: var(--color-glass-solid);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    -webkit-border-radius: 10px;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: var(--color-glass-dark-solid);
  }
}
</style>
