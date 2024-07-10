<script setup lang="ts">
import LogDumpValue from './LogDumpValue.vue'
import LogDumpKey from './LogDumpKey.vue'
import LogDumpTable from './LogDumpTable.vue'

const props = defineProps<{
  value: Record<any, any>
  index?: number
}>()

const isArray = Array.isArray(props.value)
</script>

<template>
  <details>
    <summary class="summary">
      <span class="chevron-container"><span class="chevron">▶</span></span>
      <span v-if="index !== undefined" class="index">
        <LogDumpKey :value="`[${index + 1}]`" /> =
      </span>
      <!-- Array summary -->
      <template v-if="isArray"
        >({{ value.length }}) {
        <div class="summary-wrap">
          <template v-for="(v, i) of value">
            <template v-if="Array.isArray(v)">array({{ v.length }})</template>
            <template v-else-if="typeof v === 'object'">{…}</template>
            <template v-else><LogDumpValue :value="v" /></template>
            <template v-if="i < value.length - 1">, </template>
          </template>
        </div>
        }
      </template>
      <!-- Record summary -->
      <template v-else
        >{
        <div class="summary-wrap">
          <template v-for="(v, k, i) of value">
            <LogDumpKey :value="k" /> =
            <template v-if="Array.isArray(v)">array({{ v.length }})</template>
            <template v-else-if="typeof v === 'object'">{…}</template>
            <template v-else><LogDumpValue :value="v" /></template>
            <template v-if="i < Object.keys(value).length - 1">, </template>
          </template>
        </div>
        }
      </template>
    </summary>
    <div class="content">
      <div v-for="(v, k) of value">
        <template v-if="typeof v === 'object'">
          <LogDumpTable :value="v" :index="k" class="nested-table" />
        </template>
        <template v-else
          ><LogDumpKey :value="isArray ? `[${k + 1}]` : k" /> =
          <LogDumpValue :value="v" />
        </template>
      </div>
    </div>
  </details>
</template>

<style scoped>
.nested-table {
  margin-left: -2ch;
}

.summary {
  display: flex;
  font-style: italic;
  white-space: pre;
}

.index {
  font-style: normal;
}

.summary-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
}

.content {
  margin-left: 4ch;
}

.key {
  color: var(--color-log-key);
}

.chevron-container {
  width: 2ch;
}

.chevron {
  display: inline-block;
  font-style: normal;
  font-size: 0.8em;
  vertical-align: middle;
  transition: rotate 100ms ease-in-out;

  details[open] > summary > .chevron-container > & {
    rotate: 90deg;
  }
}
</style>
