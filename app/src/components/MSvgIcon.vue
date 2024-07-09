<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <svg aria-hidden="true">
    <use :href="`#${name}`" />
  </svg>
</template>
