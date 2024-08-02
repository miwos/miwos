<script setup lang="ts">
import DevToolsTabMenu from './DevToolsTabMenu.vue'
import LogDump from './LogDump.vue'
import LogText from './LogText.vue'

import ClearIcon from '@/assets/icons/clear.svg?component'
import CloseIcon from '@/assets/icons/close.svg?component'
import { useLogs } from '@/stores/logs'
import { useEventListener } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'

const logs = useLogs()
const emit = defineEmits<{ close: [] }>()
const el = ref<HTMLDivElement | undefined>()

const shouldAutoScroll = ref(false)
useEventListener(el, 'scroll', () => {
  if (!el.value) return
  shouldAutoScroll.value =
    Math.ceil(el.value.scrollHeight - el.value.scrollTop) <=
    el.value.clientHeight
})

watch(logs.entries, async () => {
  if (el.value && shouldAutoScroll.value) {
    await nextTick()
    el.value.scrollTop = el.value.scrollHeight
  }
})
</script>

<template>
  <div class="logs" ref="el">
    <DevToolsTabMenu>
      <button @click="logs.clear()"><ClearIcon /></button>
      <button @click="emit('close')"><CloseIcon /></button>
    </DevToolsTabMenu>
    <div class="logs-content">
      <template v-for="(log, i) of logs.entries">
        <LogDump v-if="log.type === 'dump'" :value="log.value" />
        <LogText v-else :type="log.type" :text="log.value" :count="log.count" />
        <div class="divider" v-if="i < logs.entries.length - 1"></div>
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
