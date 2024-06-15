<script setup lang="ts">
import { useMappings } from '@/stores/mappings'
import MButtonCircle from '@/ui/MButtonCircle.vue'

const mappings = useMappings()
</script>

<template>
  <div class="pages-buttons glass">
    <MButtonCircle
      class="button"
      v-for="(_, i) in 3"
      :aria-selected="i === mappings.pageIndex"
      @click="mappings.selectPage(i)"
    />
  </div>
</template>

<style scoped>
.pages-buttons {
  display: flex;
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 1rem;
  border-radius: 1.5rem;
}

.button {
  display: block;

  .pages-buttons:not(:hover) & {
    transition: background-color 500ms;
  }
  .pages-buttons:hover &:not([aria-selected='true']) {
    background-color: var(--color-glass);
  }

  &[aria-selected='true'] {
    background-color: var(--color-mapping);
  }
}
</style>
