<template>
  <div class="top-bar">
    <MNavBar class="nav-bar">
      <MButtonCircle
        :style="`background-color: var(${statusColor})`"
        @click="toggleDeviceConnection"
      ></MButtonCircle>
      <button @click="toggleDeviceConnection">{{ statusText }}</button>
      <button @click="clear">Clear</button>
      <button @click="restart">Restart</button>
    </MNavBar>
    <TransportMenu />
    <MemoryMonitor />
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/stores/device'
import { useProject } from '@/stores/project'
import MButtonCircle from '@/ui/MButtonCircle.vue'
import MNavBar from '@/ui/MNavBar.vue'
import { computed } from 'vue'
import MemoryMonitor from './MemoryMonitor.vue'
import TransportMenu from './TransportMenu.vue'

const device = useDevice()
const project = useProject()

const toggleDeviceConnection = () => {
  device.isConnected ? device.close() : device.open()
}

const clear = () => project.clear()

const restart = () => device.restart()

const statusColor = computed(() =>
  device.isConnected ? '--color-active' : '--color-disabled',
)

const statusText = computed(() =>
  device.isConnected ? 'Disconnect' : 'Connect',
)
</script>

<style scoped>
.top-bar {
  display: flex;
  gap: 1rem;

  padding: 1rem;
}
.nav-bar {
  padding-left: 0 !important;
}
</style>
