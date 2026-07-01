<template>
  <div class="xl:grid xl:h-screen xl:overflow-hidden" :class="gridClasses">
    <!-- Sidebar sinistra (solo xl+) -->
    <DesktopSidebar
      class="hidden xl:flex xl:flex-col"
      :activePanel="activePanel"
      @openPanel="activePanel = $event"
    />

    <!-- Colonna centrale -->
    <div class="min-w-0">
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
import { ref, computed } from 'vue'
import MobileNavFab from '@/components/MobileNavFab.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import DesktopContentPanel from '@/components/DesktopContentPanel.vue'

const activePanel = ref(null)

const gridClasses = computed(() =>
  activePanel.value ? 'xl:grid-cols-[14rem_1fr_24rem]' : 'xl:grid-cols-[14rem_1fr]',
)
</script>
