<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { map } from '@/utils'
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{ color: string; min?: number; max?: number }>(),
  {
    min: -1,
    max: 1,
  },
)

const canvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null

let width: number | undefined
let height: number | undefined
let drawOffset = 0
let prevValue: number | undefined
const pixelRatio = Math.ceil(window.devicePixelRatio)
const lineWidth = 2 * pixelRatio
const marginHorizontal = lineWidth / 2
const step = pixelRatio

const scrollCanvas = () => {
  if (!ctx) return
  ctx.globalCompositeOperation = 'copy'
  ctx.drawImage(ctx.canvas, -step, 0)
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

  value = map(
    value,
    props.min,
    props.max,
    marginHorizontal,
    height - marginHorizontal,
  )
  const canvasIsFull = drawOffset >= width
  if (canvasIsFull) scrollCanvas()

  if (prevValue !== undefined) {
    const x = Math.min(drawOffset, width - step)
    const prevY = height - prevValue
    const y = height - value

    ctx.strokeStyle = props.color
    ctx.lineWidth = 2 * pixelRatio
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - step, prevY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  prevValue = value
  if (!canvasIsFull) drawOffset += step
}

defineExpose({ plotValue })
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
