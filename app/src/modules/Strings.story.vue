<template>
  <Story title="Strings Module">
    <Strings
      :strings="['E1', 'A2', 'D2', 'G2', 'B2', 'E3']"
      :notes="{ 1: 3, 2: 2, 4: 3, 5: 3 }"
    />
  </Story>
</template>

<script setup lang="ts">
import Strings from './Strings.vue'
</script>
