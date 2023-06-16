<template>
  <story>
    <MSelect
      :options="[
        { id: 0, label: 'One' },
        { id: 1, label: 'two' },
        { id: 2, label: 'three' },
      ]"
      v-model:value="value"
      @update:value="logEvent('update value', [$event])"
    >
      <template #option="{ label }">{{ label }}</template>
    </MSelect>
  </story>
</template>

<script setup lang="ts">
import MSelect from './MSelect.vue'
import { logEvent } from 'histoire/client'
import { ref } from 'vue'

const value = ref(0)
</script>

<style>
.m-select {
  --m-select-color-bg: gray;
  --m-select-color-focus: blue;
}
</style>
