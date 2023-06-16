<template>
  <div class="log">
    <button class="log-clear" @click="log.clear()">Clear</button>
    <div class="log-content" ref="content">
      <LogEntry v-for="entry in log.entries" v-bind="entry" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLog } from '@/stores/log'
import { nextTick, ref } from 'vue'
import LogEntry from './LogEntry.vue'

const content = ref<HTMLElement>()
const log = useLog()

log.$subscribe(() => nextTick(() => scrollToBottom()))

const scrollToBottom = () =>
  content.value && (content.value.scrollTop = content.value.scrollHeight)
</script>

<style scoped lang="scss">
.log {
  --line-height: 1.2em;
  --lines: 10;

  position: absolute;
  left: 0;
  bottom: 0;
  z-index: var(--z-panel);
  background-color: hsl(0deg 0% 12%);

  margin: 1rem;

  border-radius: var(--radius-xs);
  font-size: 10pt;

  &-clear {
    position: absolute;
    right: 0;
    top: 0;
    padding: 0.5em;
  }

  &-content {
    width: 80ch;
    height: calc(var(--lines) * var(--line-height));
    line-height: var(--line-height);
    overflow-y: auto;

    margin: 0;
    padding: var(--line-height);
    white-space: pre-wrap;
    word-break: break-all;
    font-family: monospace;
  }

  ::-webkit-scrollbar-track {
    background-color: hsl(0deg 0% 12%);
  }

  ::-webkit-scrollbar-thumb {
    background-color: hsl(0deg 0% 27%);
  }
}
</style>

<style lang="scss">
.log {
  &-file-link {
    text-decoration: underline;
    cursor: pointer;
  }

  --color-log-black: black;
  --color-log-white: white;
  --color-log-gray: #7b7b7b;
  --color-log-red: red;
  --color-log-green: rgb(32 203 80);
  --color-log-blue: blue;
  --color-log-yellow: yellow;
  --color-log-magenta: magenta;
  --color-log-cyan: cyan;

  --color-log-info: var(--color-log-white);
  --color-log-warn: var(--color-log-yellow);
  --color-log-error: var(--color-log-red);
  --color-log-success: var(--color-log-green);

  --color-log-key: var(--color-log-green);
  --color-log-specialKey: var(--color-log-cyan);
  --color-log-complexType: #ff4cf5;
  --color-log-number: tomato;
  --color-log-boolean: rgb(81 130 255);
  --color-log-string: var(--color-log-yellow);

  .mark-black {
    color: var(--color-log-black);
  }
  .mark-white {
    color: var(--color-log-white);
  }
  .mark-gray {
    color: var(--color-log-gray);
  }
  .mark-red {
    color: var(--color-log-red);
  }
  .mark-green {
    color: var(--color-log-green);
  }
  .mark-blue {
    color: var(--color-log-blue);
  }
  .mark-yellow {
    color: var(--color-log-yellow);
  }
  .mark-magenta {
    color: var(--color-log-magenta);
  }
  .mark-cyan {
    color: var(--color-log-cyan);
  }
  .mark-info {
    color: var(--color-log-info);
  }
  .mark-warn {
    color: var(--color-log-warn);
  }
  .mark-error {
    color: var(--color-log-error);
  }
  .mark-success {
    color: var(--color-log-success);
  }
  .mark-key {
    color: var(--color-log-key);
  }
  .mark-specialKey {
    color: var(--color-log-specialKey);
  }
  .mark-complexType {
    color: var(--color-log-complexType);
  }
  .mark-number {
    color: var(--color-log-number);
  }
  .mark-boolean {
    color: var(--color-log-boolean);
  }
  .mark-string {
    color: var(--color-log-string);
  }
}
</style>
