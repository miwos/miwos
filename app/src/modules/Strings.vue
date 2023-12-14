<template>
  <div class="strings" ref="el">
    <svg
      class="strings-container"
      :viewBox="`0 0 ${strings} 1`"
      preserveAspectRatio="none"
    >
      <line
        v-for="string in strings"
        class="string"
        :data-is-plucked="stringIsPlucked(string)"
        :x1="string - 0.5"
        :y1="0"
        :x2="string - 0.5"
        :y2="1"
      ></line>
    </svg>

    <div class="fret-board">
      <div
        v-for="fret in frets"
        class="fret"
        ref="fretElements"
        :data-has-mark="fretIntervalMarks.includes(fret)"
      >
        <div
          v-for="string in chordByFret[fret]"
          class="fret-pressed"
          :data-is-plucked="stringIsPlucked(string)"
          :style="`--string: ${string}`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Module, Size } from '@/types'
import { asHashTable, asArray } from '@/utils'
import { computed, onMounted, ref, effect } from 'vue'

const props = defineProps<{
  module: Module
  note: number
  tuning: number[]
  chord: number[] | undefined
  step: number
  pattern: (number | number[])[]
}>()
const emit = defineEmits<{
  (e: 'update:size', size: Size): void
}>()
const el = ref<HTMLElement | undefined>()
const fretElements = ref<HTMLElement[] | undefined>()

const strings = computed(() => props.tuning.length)
const frets = 12
const visibleFrets = 7
const fretIntervalMarks = [3, 5, 7, 9, 12]

const chordByFret = computed(() => {
  const chordTable = asHashTable(props.chord)
  const result: Record<number, number[]> = {}
  for (const [string, fret] of Object.entries(chordTable)) {
    result[fret] ??= []
    result[fret].push(+string)
  }
  return result
})

const stringIsPlucked = (string: number) => {
  const patternHashTable = asHashTable(props.pattern)
  const pluckedStrings = asArray(patternHashTable[props.step])
  return pluckedStrings.includes(string)
}

onMounted(() => {
  if (!el.value) return
  const { width, height } = el.value.getBoundingClientRect()
  emit('update:size', { width, height })
})

effect(() => {
  let lowestFret: number | undefined
  let highestFret: number | undefined

  const chordTable = asHashTable(props.chord)
  for (const string in chordTable) {
    const frets = asArray(chordTable[string])
    const min = Math.min(...frets)
    const max = Math.max(...frets)
    if (lowestFret === undefined || min < lowestFret) lowestFret = min
    if (highestFret === undefined || max > highestFret) highestFret = min
  }

  if (!el.value) return

  if (highestFret === undefined || lowestFret === undefined) {
    el.value.scrollTop = 0
    return
  }

  if (highestFret <= visibleFrets) {
    el.value.scrollTop = 0
    return
  }

  const fret = fretElements.value?.[lowestFret]
  if (fret) el.value.scrollTop = fret.getBoundingClientRect().top
})
</script>

<style scoped>
.strings {
  --fret-height: 1.5rem;
  --fret-width: 1rem;
  --visible-frets: 7;
  --strings: v-bind(strings);
  --frets: v-bind(frets);
  --transition-active-in: 50ms;
  --transition-active-out: 400ms;
  --scrollbar-width: 4px;

  height: calc(var(--fret-height) * var(--visible-frets));
  overflow-y: scroll;
  pointer-events: all;

  scroll-snap-type: block mandatory;
  scroll-behavior: smooth;
  padding-right: var(--scrollbar-width);
}

.strings-container {
  position: absolute;
  width: calc(var(--fret-width) * (var(--strings)));
  height: 100%;
  display: block;
  overflow: visible;
  pointer-events: none;
}
.string {
  stroke: black;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transition: stroke var(--transition-active-out) ease-out;

  &[data-is-plucked='true'] {
    stroke: var(--color-active);
    transition: stroke var(--transition-active-in) ease-in;
  }
}

.fret-board {
  background-color: var(--color-module-bg);
}

.fret {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(var(--strings), var(--fret-width));
  align-items: center;
  justify-items: center;
  height: var(--fret-height);

  border-bottom: 1px solid #626262;
  scroll-snap-align: center;

  &[data-has-mark='true']::before {
    width: calc(100% - 2 * var(--fret-width));
    height: 0.4rem;
    border-radius: 9999px;
    content: '';
    grid-column: 1/-1;
    grid-row: 1;
    background-color: #afafaf;
  }
}

.fret-pressed {
  grid-column: var(--string);
  grid-row: 1;
  background-color: black;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  transition: background-color var(--transition-active-out) ease-out;

  &[data-is-plucked='true'] {
    background-color: var(--color-active);
    transition: background-color var(--transition-active-in) ease-in;
  }
}

::-webkit-scrollbar {
  width: var(--scrollbar-width);
  background: none;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: var(--color-glass-solid);
}
</style>
