<template>
  <Story>
    <MNavBar class="m-nav-bar">
      <MButtonCircle color="aqua"></MButtonCircle>
      <MNavItem>File</MNavItem>
      <MNavItem>Edit</MNavItem>
    </MNavBar>
  </Story>
</template>

<script setup lang="ts">
import MNavBar from './MNavBar.vue'
import MNavItem from './MNavItem.vue'
import MButtonCircle from './MButtonCircle.vue'
</script>

<style scoped>
.m-nav-bar {
  padding-left: 0;
}
</style>
