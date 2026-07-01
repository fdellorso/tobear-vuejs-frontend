<template>
  <aside class="flex h-full flex-col justify-between border-r border-gray-200 bg-gray-50 p-4">
    <div>
      <div class="mb-6 flex items-center gap-3">
        <RouterLink to="/todo">
          <LogoIcon customClass="size-8" :noBorder="true" />
        </RouterLink>
        <span class="text-lg font-semibold text-gray-900">toBear</span>
      </div>

      <nav class="space-y-1">
        <button
          @click="$emit('openPanel', 'about')"
          class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          :class="{ 'bg-gray-200 text-gray-900': activePanel === 'about' }"
        >
          About
        </button>
        <button
          @click="$emit('openPanel', 'contact')"
          class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          :class="{ 'bg-gray-200 text-gray-900': activePanel === 'contact' }"
        >
          Contatti
        </button>
      </nav>
    </div>

    <div>
      <div v-if="mode === 'authenticated' && user" class="mb-4 space-y-2">
        <p v-if="!statsLoading" class="text-xs text-gray-500">
          <span class="font-medium text-gray-700">{{ statsTotal }}</span> task di cui
          <span class="font-medium text-green-600">{{ statsCompleted }}</span> completati
        </p>
        <p v-else class="h-4 w-24 animate-pulse rounded bg-gray-200"></p>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <template v-if="mode === 'guest'">
          <RouterLink
            to="/login"
            class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          >
            Accedi
          </RouterLink>
          <RouterLink
            to="/register"
            class="mt-1 flex w-full items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Registrati
          </RouterLink>
        </template>
        <template v-else-if="mode === 'authenticated' && user">
          <div class="px-3 py-2 text-sm font-medium text-gray-900">{{ user.name }}</div>
          <button
            @click="logout"
            class="mt-1 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          >
            Esci
          </button>
        </template>
      </div>
    </div>
  </aside>
</template>

<script setup>
import LogoIcon from '@/components/LogoIcon.vue'
import useUserStore from '@/stores/user.js'
import { router } from '@/router'
import { axiosClient } from '@/axios'
import { computed, onMounted } from 'vue'
import { useTaskStats } from '@/composables/useTaskStats'

defineProps({
  activePanel: {
    type: String,
    default: null,
  },
})

defineEmits(['openPanel'])

const userStore = useUserStore()
const user = computed(() => userStore.user)
const mode = computed(() => userStore.mode)

const { taskCount, completedCount, loading: statsLoading, fetchStats } = useTaskStats()
const statsTotal = computed(() => taskCount.value)
const statsCompleted = computed(() => completedCount.value)

function logout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}

onMounted(fetchStats)
</script>
