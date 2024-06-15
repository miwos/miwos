<template>
  <div
    class="container"
    ref="el"
    :style="`
      --strings: ${strings};
      --frets: ${frets};
      --visible-frets: ${visibleFrets};
      --fret-width: ${fretWidth}px;
      --fret-height: ${fretHeight}px;
    `"
  >
    <div class="midi-in"></div>
    <div class="nut">{{ topmostFret }}</div>
    <div class="neck" ref="neck">
      <div class="board"></div>
      <div class="frets">
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
      <svg
        class="strings"
        :viewBox="`0 0 ${strings - 1} 1`"
        preserveAspectRatio="none"
      >
        <line
          v-for="(string, index) in strings"
          class="string"
          :data-is-plucked="stringIsPlucked(string)"
          :x1="index"
          :y1="0"
          :x2="index"
          :y2="1"
        ></line>
      </svg>
    </div>
    <div class="midi-out"></div>
  </div>
</template>

<script setup lang="ts">
import type { Module, Size } from '@/types'
import { asArray, asHashTable } from '@/utils'
import { useScroll } from '@vueuse/core'
import { computed, effect, onMounted, ref, watch } from 'vue'

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
const neck = ref<HTMLElement | undefined>()
const visibleFrets = 7
const fretWidth = 18 // px
const fretHeight = 24 // px
const fretIntervalMarks = [3, 5, 7, 9, 12]
const { y: scrollTop } = useScroll(neck)
const topmostFret = computed(() => Math.floor(scrollTop.value / fretHeight) + 1)

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
  const { height = 0 } = el.value?.getBoundingClientRect() ?? {}
  props.module.inputs = [{ position: { x: fretWidth * 1.5, y: 0 } }]
  props.module.outputs = [
    { position: { x: (fretWidth * strings.value) / 2, y: height } },
  ]
})

const getFretRange = (chord: Record<number, number | number[]>) => {
  let lowestFret: number | undefined
  let highestFret: number | undefined

  const chordTable = asHashTable(chord)
  for (const string in chordTable) {
    // Ignore open strings, since they are not pressed to play the chord.
    const frets = asArray(chordTable[string]).filter((fret) => fret > 0)
    if (!frets.length) continue
    const min = Math.min(...frets)
    const max = Math.max(...frets)
    if (lowestFret === undefined || min < lowestFret) lowestFret = min
    if (highestFret === undefined || max > highestFret) highestFret = min
  }

  return [lowestFret, highestFret]
}

watch(
  () => props.chord,
  (chord = []) => {
    if (!neck.value) return

    const [lowestFret, highestFret] = getFretRange(chord)
    if (lowestFret === undefined || highestFret === undefined) return

    const fretSpan = highestFret - lowestFret
    const lowestVisibleFret = topmostFret.value
    const highestVisibleFret = lowestVisibleFret + visibleFrets - 1

    // We want to avoid unnecessary scrolling, so if the new chord is fully
    // visible we don't have to do anything.
    if (lowestFret >= lowestVisibleFret && highestFret <= highestVisibleFret) {
      return
    }

    // Always scroll to the top, if possible.
    if (highestFret <= visibleFrets) {
      neck.value.scrollTop = 0
      return
    }

    // Chord fret span is too big, just show the start.
    if (fretSpan > visibleFrets) {
      neck.value.scrollTop = (lowestFret - 1) * fretHeight
      return
    }

    // Prefer the interval marks for easier navigation.
    for (const fret of fretIntervalMarks) {
      if (lowestFret >= fret && highestFret <= fret + visibleFrets) {
        neck.value.scrollTop = (fret - 1) * fretHeight
        return
      }
    }

    neck.value.scrollTop = (lowestFret - 1) * fretHeight
  },
)
</script>

<style scoped>
.container {
  --fret-width: 1rem;
  --fret-width-half: calc(var(--fret-width) / 2);
  --board-width: calc((var(--strings) - 1) * var(--fret-width));
  --string-width: 1px;
  --transition-active-in: 50ms;
  --transition-active-out: 400ms;
  --scrollbar-width: 4px;

  display: grid;
  grid-template-columns:
    [content-start]
    calc(var(--strings) * var(--fret-width))
    [content-end]
    var(--scrollbar-width);
  pointer-events: all;
}

.midi-in {
  width: 1.5rem;
  height: 1.5rem;
  margin-left: calc(var(--fret-width) * 1.5);
  translate: -50%;
  border-top-right-radius: 100%;
  border-top-left-radius: 100%;
  background-color: var(--color-module-bg);
}

.midi-out {
  grid-column: content;
  justify-self: center;
  width: 1.5rem;
  height: 1.5rem;
  border-bottom-right-radius: 100%;
  border-bottom-left-radius: 100%;
  background-color: var(--color-module-bg);
}

.neck {
  display: grid;
  position: relative;
  grid-template-rows: calc(var(--frets) * var(--fret-height));
  grid-template-columns:
    var(--fret-width-half)
    [board-start]
    var(--board-width)
    [board-end]
    var(--fret-width-half);
  grid-column: 1/-1;

  height: calc(var(--visible-frets) * var(--fret-height));

  overflow-y: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: block mandatory;
}

.nut {
  grid-column: content;
  justify-self: center;
  width: var(--board-width);
  border-inline: var(--string-width) solid black;
  background-color: black;
  font-size: 0.7rem;
  line-height: 1.4;
  text-align: center;
}

.board {
  grid-row: 1/-1;
  grid-column: board;
  background-color: var(--color-module-bg);
}

.strings {
  display: block;
  grid-row: 1/-1;
  grid-column: board;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.string {
  stroke: black;
  stroke-width: var(--string-width);
  vector-effect: non-scaling-stroke;
  transition: stroke var(--transition-active-out) ease-out;

  &[data-is-plucked='true'] {
    stroke: var(--color-active);
    transition: stroke var(--transition-active-in) ease-in;
  }
}

.frets {
  grid-row: 1/-1;
  grid-column: 1/-1;
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
    grid-row: 1;
    grid-column: 1/-1;
    width: calc(100% - 2 * var(--fret-width));
    height: 0.4rem;
    border-radius: 9999px;
    background-color: #afafaf;
    content: '';
  }
}

.fret-pressed {
  grid-row: 1;
  grid-column: var(--string);
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 9999px;
  background-color: black;
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
  border-radius: var(--scrollbar-width);
  background: var(--color-glass-solid);
}
</style>
