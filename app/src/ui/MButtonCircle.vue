<template>
  <button class="m-button-circle" @click="emit('click', $event)"></button>
</template>

<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<style scoped>
.m-button-circle {
  width: 2.5rem;
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}
</style>
