<template>
  <MDropdown
    :options="device.midiDevices"
    :value="props.device"
    @update:value="emit('update:device', $event)"
    theme="default"
    label="Dropdown"
    preferredAlignment="below"
    class="module-output-content"
  >
    <template #currentOption="{ label }">
      <div class="font-vevey">{{ label }}</div>
    </template>
    <template #option="{ label }">{{ label }}</template>
  </MDropdown>
</template>

<script setup lang="ts">
import { useDevice } from '@/stores/device'
import MDropdown from '@/ui/MDropdown.vue'

const props = defineProps<{
  device: number
  cable: number
}>()

const emit = defineEmits<{
  (e: 'update:device', device: number): void
}>()

const device = useDevice()
</script>

<style scoped lang="scss">
.module-output-content {
  pointer-events: all;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.m-dropdown {
  z-index: var(--z-menu);
}

:deep(.m-dropdown-list) {
  min-width: 67px;
}

:deep(.m-dropdown-current-option) {
  padding: 0.3em 0 0.4em 0;
}
</style>
