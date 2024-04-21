<script setup lang="ts">
import { useMidi } from '@/stores/midi'
import MNavBar from '@/ui/MNavBar.vue'
import { ref } from 'vue'

const { metronomeSide, start, stop, setTempo, isPlaying } = useMidi()
const tempoInput = ref<HTMLInputElement>()

const handleChangeTempo = (bpm: string) => {
  setTempo(+bpm)
  const displayValue = parseFloat(tempoInput.value?.value ?? '0').toFixed(2)
  tempoInput.value!.value = displayValue
}

const togglePlay = () => {
  if (isPlaying.value) stop()
  else start()
}
</script>

<template>
  <MNavBar class="transport-menu">
    <div class="metronome">
      <div class="metronome-dot" :data-active="metronomeSide === 'left'"></div>
      <div class="metronome-dot" :data-active="metronomeSide === 'right'"></div>
    </div>
    <input
      class="tempo-input"
      type="number"
      ref="tempoInput"
      value="120.00"
      step="1.00"
      @change="handleChangeTempo(($event.target as HTMLInputElement).value)"
    />
    <button @click="togglePlay">{{ isPlaying ? 'stop' : 'start' }}</button>
  </MNavBar>
</template>

<style scoped>
.metronome {
  display: flex;
  gap: 0.3rem;
}

.metronome-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 0.6rem;
  border: 1px solid yellow;

  &[data-active='true'] {
    background-color: yellow;
  }
}

.tempo-input {
  font-variant-numeric: tabular-nums;
  width: 3.7em;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
}
</style>
