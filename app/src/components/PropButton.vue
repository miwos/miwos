<template>
  <button class="prop-button">{{ name }}</button>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<style scoped lang="scss">
.prop-button {
  text-transform: capitalize;
  padding: 0 0.75rem;
  line-height: 2.2;
  border-radius: var(--radius-xs);
  cursor: pointer;
}
</style>
