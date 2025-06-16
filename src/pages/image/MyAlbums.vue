<script setup>
import { axiosClient } from '@/axios'
import { onMounted, ref } from 'vue'
import ImageGallery from '@/components/ImageGallery.vue'

const images = ref([])

async function copyImageUrl(imageUrl) {
  await navigator.clipboard.writeText(imageUrl)
}

function deleteImage(id) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return
  }

  // axiosClient.post(`/myimages/${id}`, { _method: 'DELETE' }).then(() => {
  //   images.value = images.value.filter((image) => image.id !== id)
  // })

  axiosClient.post(`/v1/image/${id}/delete`).then(() => {
    images.value = images.value.filter((image) => image.id !== id)
  })
}

onMounted(() => {
  axiosClient.get('/v1/image').then((response) => {
    images.value = response.data.data
  })
})
</script>

<template>
  <ImageGallery :images="images" @copy="copyImageUrl" @delete="deleteImage">My Albums</ImageGallery>
</template>

<style scoped></style>
