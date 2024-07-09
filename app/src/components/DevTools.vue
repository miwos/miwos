<script setup lang="ts">
import ErrorIcon from '@/assets/icons/error.svg?component'
import WarningIcon from '@/assets/icons/warning.svg?component'
import RamIcon from '@/assets/icons/ram.svg?component'
import BarTabLeft from '@/assets/icons/bar-tab-left.svg?component'
import BarTabRight from '@/assets/icons/bar-tab-right.svg?component'

import { TabsRoot, TabList, TabTrigger, TabContent } from '@ark-ui/vue'
import DevToolsMemory from './DevToolsMemory.vue'

</script>

<template>
  <nav class="dev-tools glass">
    <TabsRoot  defaultValue="logs" lazyMount unmountOnExit>
      <TabContent value="logs" class="tab-content" data-first>Logs</TabContent>
      <TabContent value="memory" class="tab-content">
        <DevToolsMemory />
      </TabContent>
      <TabList class="tab-list">
        <TabTrigger value="logs" class="tab-trigger">
          <div class="tab" style="gap: 0.5rem">
            <div class="counter">
              <ErrorIcon class="icon" />
              <span style="padding-left: 0.2em">3</span>
            </div>
            <div class="counter">
              <WarningIcon class="icon" />
              <span style="padding-left: 0.1em">2</span>
            </div>
          </div>
          <BarTabRight class="tab-side" />
        </TabTrigger>
        <TabTrigger value="memory" class="tab-trigger">
          <BarTabLeft class="tab-side" />
          <div class="tab">
            <RamIcon class="icon" />
            <span style="padding-left: 0.2em">Low</span>
          </div>
        </TabTrigger>
      </TabList>
    </TabsRoot>
  </nav>
</template>

<style scoped>
.dev-tools {
  --radius-bar: calc(2.5rem / 2);
  --panel-bg: var(--color-glass-dark-solid);

  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  align-items: center;
  height: 2.5rem;
  margin: 1rem;
  gap: 0.5em;
  border-radius: var(--radius-bar);
}

.icon {
  width: auto;
  height: 1.25rem;

  &:deep(path) {
    vector-effect: non-scaling-stroke;
  }
}

.counter {
  display: flex;
  align-items: center;
}

.tab-list {
  display: flex;
}

.tab-trigger {
  display: flex;
  &:not(:first-child) {
    margin-left: -2rem;
  }
}

.tab {
  display: flex;
  align-items: center;

  .tab-trigger[data-selected] & {
    background-color: var(--panel-bg);
  }

  .tab-trigger:first-child & {
    padding-left: 0.7rem;
    border-bottom-left-radius: var(--radius-bar);
  }

  .tab-trigger:last-child & {
    padding-right: 0.7rem;
    border-bottom-right-radius: var(--radius-bar);
  }
}

.tab-side {
  display: block;
  height: 100%;
  /* Prevent flash of background (render bug in chrome) */
  margin-inline: -0.1px;

  .tab-trigger:not([data-selected]) & {
    visibility: hidden;
  }

  &:deep(path[data-name='bg']) {
    fill: var(--panel-bg);
  }
}

.tab-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 60ch;
  height: 10lh;
  padding: 0.25rem;
  transform: translateY(-100%);
  border-top-right-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--panel-bg);

  > * {
    border-radius: 0.3rem;
    overflow: hidden;
  }

  &[data-first] {
    border-bottom-left-radius: 0;
  }
}

</style>