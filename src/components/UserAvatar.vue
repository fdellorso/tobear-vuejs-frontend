<template>
  <div>
    <canvas ref="canvas" :width="size" :height="size" style="display: none"></canvas>
    <img
      :src="avatarDataUrl"
      :alt="name || 'Avatar'"
      :width="size"
      :height="size"
      :style="circularStyle"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 100 },
  backgroundColor: { type: String, default: '#3498db' },
  textColor: { type: String, default: '#ffffff' },
  iconColor: { type: String, default: '#ffffff' }, // nuovo colore silhouette
})

const canvas = ref(null)
const avatarDataUrl = ref('')

const circularStyle = computed(() => ({
  borderRadius: '50%',
  display: 'block',
}))

function getInitials(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return null
  }

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function getUserIconSVG(color) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" fill="${color}" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M12 2a5 5 0 00-3.535 8.535A8.001 8.001 0 004 18a1 1 0 102 0 6 6 0 1112 0 1 1 0 102 0 8.001 8.001 0 00-4.465-7.465A5 5 0 0012 2zm-3 5a3 3 0 116 0 3 3 0 01-6 0z" clip-rule="evenodd"/>
  </svg>
  `
}

function drawAvatar() {
  const ctx = canvas.value.getContext('2d')
  const fontSize = props.size * 0.5

  ctx.clearRect(0, 0, props.size, props.size)
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, props.size, props.size)

  const initials = getInitials(props.name)

  if (initials) {
    ctx.fillStyle = props.textColor
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, props.size / 2, props.size / 2)
    avatarDataUrl.value = canvas.value.toDataURL()
  } else {
    const svg = getUserIconSVG(props.iconColor)
    const svgBase64 = `data:image/svg+xml;base64,${btoa(svg)}`
    const img = new Image()
    img.onload = () => {
      const padding = props.size * 0.15
      ctx.drawImage(img, padding, padding, props.size - 2 * padding, props.size - 2 * padding)
      avatarDataUrl.value = canvas.value.toDataURL()
    }
    img.src = svgBase64
  }
}

onMounted(drawAvatar)
watch(() => props.name, drawAvatar)
watch(() => props.size, drawAvatar)
watch(() => props.iconColor, drawAvatar)
</script>
