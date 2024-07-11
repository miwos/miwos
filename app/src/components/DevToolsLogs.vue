<script setup lang="ts">
import { useDevice } from '@/stores/device'
import { useLog } from '@/stores/log'
import TheLog from './TheLog.vue'
import LogText from './LogText.vue'
import LogDump from './LogDump.vue'
import DevToolsTabMenu from './DevToolsTabMenu.vue'

import ClearIcon from '@/assets/icons/clear.svg?component'
import CloseIcon from '@/assets/icons/close.svg?component'

const device = useDevice()

const emit = defineEmits<{ close: [] }>()

const clear = () => (device.logs = [])
</script>

<template>
  <div class="logs">
    <DevToolsTabMenu>
      <button @click="clear"><ClearIcon /></button>
      <button @click="emit('close')"><CloseIcon /></button>
    </DevToolsTabMenu>
    <div class="logs-content">
      <template v-for="(log, i) of device.logs">
        <LogDump v-if="log.type === 'dump'" :value="log.value" />
        <LogText v-else :type="log.type" :text="log.value" :count="0" />
        <div class="divider" v-if="i < device.logs.length - 1"></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.logs {
  height: 100%;
  /* TODO: remove `!important` */
  overflow-y: auto !important;
  overflow-y: auto;

  font-family: monospace;
  /* TODO: add some minimal floating scrollbars, like SimpleBar */
  scrollbar-width: none;
}

.logs-content {
  padding-block: 0.5lh;
  cursor: default;
  > *:not(.divider) {
    padding-inline: 0.5lh;
  }
}

.divider {
  box-sizing: border-box;
  width: 100%;
  height: 1lh;
  padding-top: 0.6lh;

  &:after {
    display: block;
    border-bottom: 1px solid var(--color-log-gray);
    content: '';
  }
}
</style>
