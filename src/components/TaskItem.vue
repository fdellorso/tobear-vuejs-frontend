<template>
  <div ref="container" class="relative overflow-hidden min-h-12 rounded-lg shadow-md">
    <i
      ref="draggable"
      class="absolute z-10 w-2/2 min-h-12 left-0 px-3 bg-gray-100 hover:bg-yellow-700 font-bold content-center cursor-grab select-none transition-all duration-300"
      :style="{ left: `${left}px` }"
      aria-hidden="true"
      @mousedown="startDrag"
      @touchstart.prevent="startDragTouch"
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
import { ref, onBeforeUnmount } from 'vue'

const draggable = ref(null)
const container = ref(null)
const leftAction = ref(null)
const rightAction = ref(null)
const left = ref(0)

let startX = 0
let startLeft = 0
let isDragging = false

defineProps({
  title: String,
})

const emit = defineEmits(['complete', 'delete', 'horizontal-dragging'])

const startDrag = (e) => {
  isDragging = true
  emit('horizontal-dragging', true)
  startX = e.clientX
  startLeft = left.value

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging) return

  const dx = e.clientX - startX
  const containerWidth = container.value.offsetWidth
  const maxOffset = containerWidth * 0.3
  const newLeft = startLeft + dx

  // Clamping
  left.value = Math.min(Math.max(newLeft, -maxOffset), maxOffset)

  // Highlight logic
  const atRight = left.value >= maxOffset
  const atLeft = left.value <= -maxOffset

  leftAction.value.style.opacity = atLeft ? '1' : '0.5'
  rightAction.value.style.opacity = atRight ? '1' : '0.5'

  // Trigger event only once per drag
  if (atLeft && !leftAction.value.dataset.triggered) {
    emit('delete')
    leftAction.value.dataset.triggered = 'true'
  } else if (!atLeft) {
    leftAction.value.dataset.triggered = ''
  }

  if (atRight && !rightAction.value.dataset.triggered) {
    emit('complete')
    rightAction.value.dataset.triggered = 'true'
  } else if (!atRight) {
    rightAction.value.dataset.triggered = ''
  }
}

const stopDrag = () => {
  if (isDragging) {
    isDragging = false
    emit('horizontal-dragging', false)
    left.value = 0 // Torna alla posizione originale
    leftAction.value.style.opacity = '0.5'
    rightAction.value.style.opacity = '0.5'
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
}

const startDragTouch = (e) => {
  e.preventDefault()
  isDragging = true
  startX = e.touches[0].clientX
  startLeft = left.value

  document.addEventListener('touchmove', onDragTouch, { passive: false })
  document.addEventListener('touchend', stopDragTouch)
}

const onDragTouch = (e) => {
  if (!isDragging) return
  e.preventDefault()

  const dx = e.touches[0].clientX - startX
  const containerWidth = container.value.offsetWidth
  const maxOffset = containerWidth * 0.3
  const newLeft = startLeft + dx

  left.value = Math.min(Math.max(newLeft, -maxOffset), maxOffset)

  const atRight = left.value >= maxOffset
  const atLeft = left.value <= -maxOffset

  leftAction.value.style.opacity = atLeft ? '1' : '0.5'
  rightAction.value.style.opacity = atRight ? '1' : '0.5'

  if (atLeft && !leftAction.value.dataset.triggered) {
    emit('delete')
    leftAction.value.dataset.triggered = 'true'
  } else if (!atLeft) {
    leftAction.value.dataset.triggered = ''
  }

  if (atRight && !rightAction.value.dataset.triggered) {
    emit('complete')
    rightAction.value.dataset.triggered = 'true'
  } else if (!atRight) {
    rightAction.value.dataset.triggered = ''
  }
}

const stopDragTouch = () => {
  if (!isDragging) return
  isDragging = false

  // Torna sempre a zero (posizione di partenza)
  left.value = 0
  leftAction.value.style.opacity = '0.5'
  rightAction.value.style.opacity = '0.5'

  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDragTouch)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDragTouch)
})
</script>

<style scoped>
.min-h-12 {
  min-height: 3rem; /* 48px */
}
</style>
