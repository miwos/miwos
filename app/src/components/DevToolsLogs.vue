<script setup lang="ts">
import { useDevice } from '@/stores/device'
import { useLog } from '@/stores/log'
import TheLog from './TheLog.vue'
import LogText from './LogText.vue'
import LogDump from './LogDump.vue'

const device = useDevice()
const log = useLog()

const logs = [{ type: 'info', text: 'fu ./init.lua' }]
</script>

<template>
  <div class="logs">
    <div class="logs-content">
      <LogText
        text="init.lua:10: Is red {red color} text "
        type="warn"
        :count="0"
      />
      <hr />
      <LogDump
        :value="[1, 'zwei', false, '#function#', [1, 2, 3], { 1: 'one' }]"
      />
      <hr />
      <LogDump :value="{ name: 'Miwos', enabled: true, '[3]': 'drei' }" />
      <!-- <TheLog />   -->
    </div>
  </div>
</template>

<style scoped>
.logs {
  height: 100%;

  /* TODO: remove `!important` */
  overflow-y: auto !important;
  font-size: 12px;
  font-family: monospace;
}

.logs-content {
  padding-block: 0.5rem;
  cursor: default;
  > * {
    padding-inline: 0.5rem;
  }
}

hr {
  margin-block: 0.5lh;
}
</style>
