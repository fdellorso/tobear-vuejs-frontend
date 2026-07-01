<template>
  <div class="xl:grid xl:h-screen xl:overflow-hidden" :class="gridClasses">
    <!-- Sidebar sinistra (solo xl+) -->
    <DesktopSidebar
      class="hidden xl:flex xl:flex-col"
      :activePanel="activePanel"
      @openPanel="activePanel = $event"
    />

    <!-- Colonna centrale -->
    <div
      class="min-w-0 xl:overflow-y-auto xl:h-full xl:[scrollbar-width:none] xl:[&::-webkit-scrollbar]:hidden"
    >
      <main class="pb-20 xl:pb-0">
        <RouterView />
      </main>
    </div>

    <!-- Pannello destro contestuale (solo xl+, quando attivo) -->
    <DesktopContentPanel
      v-if="activePanel"
      class="hidden xl:block"
      :section="activePanel"
      @close="activePanel = null"
    />
  </div>

  <MobileNavFab />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileNavFab from '@/components/MobileNavFab.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import DesktopContentPanel from '@/components/DesktopContentPanel.vue'

const route = useRoute()
const router = useRouter()

const activePanel = ref(null)

const gridClasses = computed(() =>
  activePanel.value ? 'xl:grid-cols-[14rem_1fr_24rem]' : 'xl:grid-cols-[14rem_1fr]',
)

function handlePanelRedirect(path) {
  if (window.innerWidth >= 1280) {
    if (path === '/about') {
      activePanel.value = 'about'
      router.push('/todo')
    } else if (path === '/contact') {
      activePanel.value = 'contact'
      router.push('/todo')
    }
  }
}

watch(() => route.path, handlePanelRedirect)

function onResize() {
  handlePanelRedirect(route.path)
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>
