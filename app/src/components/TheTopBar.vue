<template>
  <MNavBar class="m-top-bar">
    <MButtonCircle
      :style="`background-color: var(${statusColor})`"
      @click="toggleDeviceConnection"
    ></MButtonCircle>
    <button @click="toggleDeviceConnection">{{ statusText }}</button>
    <button @click="clear">Clear</button>
  </MNavBar>
</template>

<script setup lang="ts">
import { useDevice } from '@/stores/device'
import { useProject } from '@/stores/project'
import MButtonCircle from '@/ui/MButtonCircle.vue'
import MNavBar from '@/ui/MNavBar.vue'
import { computed } from 'vue'

const device = useDevice()
const project = useProject()

const toggleDeviceConnection = () => {
  device.isConnected ? device.close() : device.open()
}

const clear = () => {
  project.clear()
}

const statusColor = computed(() =>
  device.isConnected ? '--color-active' : '--color-disabled'
)

const statusText = computed(() =>
  device.isConnected ? 'Disconnect' : 'Connect'
)
</script>

<style scoped>
.m-top-bar {
  padding-left: 0 !important;
  margin: 1rem;
}
</style>
