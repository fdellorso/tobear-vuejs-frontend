<template>
  <div ref="container" class="relative overflow-hidden min-h-12 rounded-lg shadow-md">
    <i
      ref="draggable"
      class="absolute z-10 w-2/2 min-h-12 left-0 px-3 bg-gray-100 hover:bg-yellow-700 font-bold content-center cursor-grab select-none transition-all duration-300"
      :style="{ left: `${left}px` }"
      aria-hidden="true"
      @touchstart="startDragTouch"
      >{{ title }}</i
    >
    <span
      ref="rightAction"
      class="absolute w-1/2 min-h-12 left-0 px-3 bg-green-500 content-center text-start transition-all"
      style="opacity: 0.5"
      >Completed</span
    >
    <span
      ref="leftAction"
      class="absolute w-1/2 min-h-12 right-0 px-3 bg-red-500 content-center text-end transition-all"
      style="opacity: 0.5"
      >Delete</span
    >
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const draggable = ref(null)
const container = ref(null)
const leftAction = ref(null)
const rightAction = ref(null)
const left = ref(0)

let startX = 0
let startY = 0
let startLeft = 0
let isDragging = false

const props = defineProps({
  title: String,
  dragActive: Boolean,
})

const emit = defineEmits(['complete', 'delete', 'horizontal-dragging'])

watch(
  () => props.dragActive,
  (active) => {
    if (active) {
      navigator.vibrate?.(50)
      container.value?.classList.add('is-lifted')
      document.removeEventListener('touchmove', onDragTouch)
      document.removeEventListener('touchend', stopDragTouch)
    } else {
      container.value?.classList.remove('is-lifted')
    }
  },
)

const startDragTouch = (e) => {
  const touch = e.touches[0]
  startX = touch.clientX
  startY = touch.clientY
  startLeft = left.value

  document.addEventListener('touchmove', onDragTouch, { passive: false })
  document.addEventListener('touchend', stopDragTouch)
}

const getMaxOffset = () => container.value.offsetWidth * 0.35

const handleSwipe = (dx) => {
  const maxOffset = getMaxOffset()
  const newLeft = startLeft + dx

  left.value = Math.min(Math.max(newLeft, -maxOffset), maxOffset)

  const ratio = Math.abs(left.value) / maxOffset
  const opacity = String(0.5 + ratio * 0.5)

  leftAction.value.style.opacity = left.value <= 0 ? opacity : '0.5'
  rightAction.value.style.opacity = left.value >= 0 ? opacity : '0.5'
}

const releaseSwipe = () => {
  if (!isDragging) {
    document.removeEventListener('touchmove', onDragTouch)
    document.removeEventListener('touchend', stopDragTouch)
    return
  }

  isDragging = false
  emit('horizontal-dragging', false)

  const maxOffset = getMaxOffset()
  const containerWidth = container.value.offsetWidth
  let action = null

  if (left.value >= maxOffset) {
    action = 'complete'
  } else if (left.value <= -maxOffset) {
    action = 'delete'
  }

  if (action) {
    const direction = action === 'complete' ? 1 : -1
    left.value = direction * containerWidth

    setTimeout(() => {
      if (container.value) {
        left.value = 0
        if (leftAction.value) leftAction.value.style.opacity = '0.5'
        if (rightAction.value) rightAction.value.style.opacity = '0.5'
      }
      emit(action)
    }, 350)
  } else {
    left.value = 0
    leftAction.value.style.opacity = '0.5'
    rightAction.value.style.opacity = '0.5'
  }

  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDragTouch)
}

const onDragTouch = (e) => {
  if (isDragging) {
    e.preventDefault()
    handleSwipe(e.touches[0].clientX - startX)
    return
  }

  const touch = e.touches[0]
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx > 10 && absDx > absDy) {
    e.preventDefault()
    isDragging = true
    emit('horizontal-dragging', true)
    startLeft = left.value
    handleSwipe(dx)
  } else if (absDy > 10 && absDy >= absDx) {
    document.removeEventListener('touchmove', onDragTouch)
    document.removeEventListener('touchend', stopDragTouch)
  }
}

const stopDragTouch = () => {
  releaseSwipe()
}

onBeforeUnmount(() => {
  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDragTouch)
})
</script>

<style scoped>
.min-h-12 {
  min-height: 3rem; /* 48px */
}

.is-lifted {
  transform: scale(1.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
  z-index: 100;
}
</style>
