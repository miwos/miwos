<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <button class="prop-button">{{ name }}</button>
</template>

<style scoped>
.prop-button {
  padding: 0 0.75rem;
  border-radius: var(--radius-xs);
  line-height: 2.2;
  text-transform: capitalize;
  cursor: pointer;
}
</style>
