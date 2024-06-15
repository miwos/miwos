<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { ModuleDefinition } from '@/types'
import type { ItemDefinition } from '@/types/Item'
import { ref, watchEffect } from 'vue'
import MSelect from '../ui/MSelect.vue'

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

<template>
  <div class="module-search">
    <input
      class="input glass pill"
      ref="input"
      placeholder="Search…"
      spellcheck="false"
      :value="query"
      @input="query = ($event.target as any).value"
      @blur="emit('blur')"
    />
    <MSelect
      class="results"
      :options="results"
      theme="none"
      @update:value="emit('select', $event)"
    >
      <template #option="{ id, isFocused }">
        <div class="option pill" :class="isFocused ? 'glass-dark' : 'glass'">
          {{ id }}
        </div>
      </template>
    </MSelect>
  </div>
</template>

<style>
.module-search {
  display: grid;
  grid-template-rows: max-content;
  grid-template-columns:
    [search-start] 1.5rem
    [results-start] 1fr [search-end]
    0.5rem [results-end];
  height: 100%;
  gap: 0.5rem;
  color: white;
}

.input {
  grid-column: search;
  &:focus {
    outline-color: var(--color-active);
  }
}

.input::placeholder {
  color: #a1a1a1;
  font-weight: 400;
}

.results {
  display: flex;
  grid-column: results;
  flex: 1;
  flex-direction: column;

  height: 100%;
  margin: 0;
  margin-left: 1.5rem;

  padding-right: 7px;
  overflow-y: auto;

  gap: 0.5rem;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
    background: var(--color-glass-solid);
  }

  &::-webkit-scrollbar-track {
    -webkit-border-radius: 10px;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: var(--color-glass-dark-solid);
  }
}
</style>
