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

<script setup lang="ts">
import { useMappings } from '@/stores/mappings'
import MButtonCircle from '@/ui/MButtonCircle.vue'

const mappings = useMappings()
</script>

<style scoped>
.pages-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 1rem;

  display: flex;
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
