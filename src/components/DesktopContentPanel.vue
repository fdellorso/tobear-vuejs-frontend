<template>
  <aside
    class="h-full overflow-y-auto border-l border-tb-border bg-tb-surface p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-tb-text-muted uppercase tracking-wider">
        {{ section === 'about' ? 'About' : 'Contatti' }}
      </h3>
      <button
        @click="$emit('close')"
        class="rounded p-1 text-tb-text-muted hover:bg-tb-nav-active hover:text-tb-text-sec"
      >
        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <AboutContent v-if="section === 'about'" />
    <ContactContent v-else-if="section === 'contact'" />
  </aside>
</template>

<script setup>
import AboutContent from '@/components/AboutContent.vue'
import ContactContent from '@/components/ContactContent.vue'

defineProps({
  section: {
    type: String,
    default: null,
    validator: (v) => v === null || v === 'about' || v === 'contact',
  },
})

defineEmits(['close'])
</script>
