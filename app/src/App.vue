<script setup lang="ts">
import { RouterView } from 'vue-router'

// TODO: add undo/redo again, this time with some sort of snapshots or state
// diffing instead of the more error-prone command pattern.
// const keys = useMagicKeys()
// watch(keys['Ctrl+Z'], (v) => v && undo())
// watch(keys['Ctrl+Y'], (v) => v && redo())
</script>

<template>
  <RouterView />
</template>
