<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template>
  <button class="button" @click="emit('click', $event)"></button>
</template>

<style scoped>
.button {
  width: 2.5rem;
  min-width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
</style>
