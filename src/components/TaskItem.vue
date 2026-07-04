<template>
  <div ref="container" class="relative overflow-hidden min-h-12 rounded-lg shadow-md group">
    <div
      ref="swipeAction"
      class="md:hidden absolute inset-0 flex items-center px-6 transition-all"
      :class="swipeDirection === -1 ? 'justify-end' : 'justify-start'"
      style="opacity: 0"
    >
      <span v-show="swipeDirection === 1" class="text-white font-semibold text-sm">{{
        swipeLeftLabel
      }}</span>
      <span v-show="swipeDirection === -1" class="text-white font-semibold text-sm">{{
        swipeRightLabel
      }}</span>
    </div>

    <div
      ref="draggable"
      class="flex items-center min-h-12 bg-tb-surface transition-all duration-300"
      :class="
        isDesktop ? 'relative rounded-lg' : 'absolute w-full left-0 z-10 cursor-grab select-none'
      "
      :style="isDesktop ? {} : { left: `${left}px` }"
      @touchstart="startDragTouch"
    >
      <span
        class="hidden md:flex drag-handle cursor-grab px-3 text-tb-text-muted hover:text-tb-text-sec select-none touch-none"
        @mousedown.stop
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </span>

      <div class="flex-1 min-w-0" @click="handleTap">
        <span v-if="!editing" class="block px-3 py-3 truncate">{{ title }}</span>
        <input
          v-else
          ref="editInput"
          v-model="editTitle"
          type="text"
          class="block w-full px-3 py-3 bg-transparent border-0 outline-none ring-2 ring-[var(--color-tb-accent)]/30 rounded"
          @blur="saveEdit"
          @keydown.enter="$event.target.blur()"
          @keydown.escape="cancelEdit"
          @click.stop
        />
      </div>

      <div
        class="hidden md:flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out"
      >
        <button
          @click.stop="emit('complete')"
          class="p-1.5 rounded-full transition-colors"
          :class="
            completed
              ? 'text-tb-warning bg-tb-warning-bg hover:bg-tb-warning-bg'
              : 'text-tb-success bg-tb-success-bg hover:bg-tb-success-bg'
          "
          :title="completed ? t('todo.restoreAction') : t('todo.completeAction')"
        >
          <svg
            v-if="!completed"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <button
          @click.stop="emit('delete')"
          class="p-1.5 rounded-full text-tb-danger bg-tb-danger-bg hover:bg-tb-danger-bg transition-colors"
          :title="t('todo.deleteAction')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const draggable = ref(null)
const container = ref(null)
const swipeAction = ref(null)
const left = ref(0)
const swipeDirection = ref(0) // 0 = nessuno, 1 = destra (completa), -1 = sinistra (elimina)
const editing = ref(false)
const editTitle = ref('')
const editInput = ref(null)

let startX = 0
let startY = 0
let startLeft = 0
let startTime = 0
let isDragging = false
let wasSwiped = false
let lastTouchTime = 0

const props = defineProps({
  title: String,
  dragActive: Boolean,
  completed: {
    type: Boolean,
    default: false,
  },
})

const swipeLeftLabel = computed(() =>
  props.completed ? t('todo.restoreAction') : t('todo.completeAction'),
)
const swipeRightLabel = computed(() => t('todo.deleteAction'))

const { t } = useI18n()

const emit = defineEmits(['complete', 'delete', 'horizontal-dragging', 'edit'])

const isDesktop =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

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
  startTime = Date.now()
  lastTouchTime = Date.now()
  wasSwiped = false

  document.addEventListener('touchmove', onDragTouch, { passive: false })
  document.addEventListener('touchend', stopDragTouch)
}

const getMaxOffset = () => container.value.offsetWidth * 0.35

const handleSwipe = (dx) => {
  const maxOffset = getMaxOffset()
  const newLeft = startLeft + dx
  left.value = Math.min(Math.max(newLeft, -maxOffset), maxOffset)
  swipeDirection.value = left.value > 0 ? 1 : left.value < 0 ? -1 : 0

  const ratio = Math.abs(left.value) / maxOffset
  const opacity = 0.5 + ratio * 0.5

  if (!swipeAction.value) return

  swipeAction.value.style.opacity = String(opacity)

  if (left.value > 0) {
    swipeAction.value.style.backgroundColor = props.completed ? '#f97316' : '#22c55e'
  } else if (left.value < 0) {
    swipeAction.value.style.backgroundColor = '#ef4444'
  }
}

const releaseSwipe = (e) => {
  if (!isDragging) {
    document.removeEventListener('touchmove', onDragTouch)
    document.removeEventListener('touchend', stopDragTouch)

    const touch = e?.changedTouches?.[0]
    if (touch) {
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const elapsed = Date.now() - startTime
      if (elapsed < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        beginEdit()
        return
      }
    }
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
        if (swipeAction.value) swipeAction.value.style.opacity = '0'
        swipeDirection.value = 0
      }
      emit(action)
    }, 350)
  } else {
    left.value = 0
    if (swipeAction.value) swipeAction.value.style.opacity = '0'
    swipeDirection.value = 0
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
    wasSwiped = true
    emit('horizontal-dragging', true)
    startLeft = left.value
    handleSwipe(dx)
  } else if (absDy > 10 && absDy >= absDx) {
    document.removeEventListener('touchmove', onDragTouch)
    document.removeEventListener('touchend', stopDragTouch)
  }
}

const stopDragTouch = (e) => {
  releaseSwipe(e)
}

const beginEdit = () => {
  editing.value = true
  editTitle.value = props.title
  nextTick(() => editInput.value?.focus())
}

const handleTap = () => {
  if (wasSwiped || editing.value || props.dragActive) return
  if (Date.now() - lastTouchTime < 1000) return
  beginEdit()
}

const saveEdit = () => {
  if (!editing.value) return
  editing.value = false
  const trimmed = editTitle.value.trim()
  if (trimmed && trimmed !== props.title) {
    emit('edit', trimmed)
  }
}

const cancelEdit = () => {
  if (!editing.value) return
  editing.value = false
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
