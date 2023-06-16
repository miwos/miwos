<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { map } from '@/utils'
import { onMounted, ref } from 'vue'

const props = defineProps<{ color: string }>()

const canvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null

let width: number | undefined
let height: number | undefined
let drawOffset = 0
let prevValue: number | undefined
const pixelRatio = Math.ceil(window.devicePixelRatio)
const lineWidth = 2 * pixelRatio
const marginHorizontal = lineWidth / 2

const scrollCanvas = () => {
  if (!ctx) return
  ctx.globalCompositeOperation = 'copy'
  ctx.drawImage(ctx.canvas, -pixelRatio, 0)
  ctx.globalCompositeOperation = 'source-over'
}

onMounted(() => {
  if (!canvas.value) return

  ctx = canvas.value!.getContext('2d')!

  const bounds = canvas.value.getBoundingClientRect()
  width = bounds.width * pixelRatio
  height = bounds.height * pixelRatio

  canvas.value.width = width
  canvas.value.height = height
})

const plotValue = (value: number) => {
  if (!width || !height || !ctx) return

  value = map(value, -1, 1, marginHorizontal, height - marginHorizontal)
  const canvasIsFull = drawOffset >= width
  if (canvasIsFull) scrollCanvas()

  if (prevValue !== undefined) {
    let x = Math.min(drawOffset, width - pixelRatio)
    ctx.strokeStyle = props.color
    ctx.lineWidth = 2 * pixelRatio
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - pixelRatio, prevValue)
    ctx.lineTo(x, value)
    ctx.stroke()
  }

  prevValue = value
  if (!canvasIsFull) drawOffset += pixelRatio
}

defineExpose({ plotValue })
</script>

<style scoped lang="scss">
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
