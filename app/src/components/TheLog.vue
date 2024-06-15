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

<template>
  <div class="log">
    <button class="clear" @click="log.clear()">Clear</button>
    <div class="content" ref="content">
      <LogEntry v-for="entry in log.entries" v-bind="entry" />
    </div>
  </div>
</template>

<style scoped>
.log {
  --line-height: 1.2em;
  --lines: 10;
  z-index: var(--z-panel);

  position: absolute;
  bottom: 0;
  left: 0;

  margin: 1rem;

  border-radius: var(--radius-xs);
  background-color: hsl(0deg 0% 12%);
  font-size: 10pt;

  ::-webkit-scrollbar-track {
    background-color: hsl(0deg 0% 12%);
  }

  ::-webkit-scrollbar-thumb {
    background-color: hsl(0deg 0% 27%);
  }
}

.clear {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5em;
}

.content {
  width: 80ch;
  height: calc(var(--lines) * var(--line-height));
  margin: 0;
  padding: var(--line-height);
  overflow-y: auto;
  line-height: var(--line-height);
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

<style>
.log {
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

.log-file-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
