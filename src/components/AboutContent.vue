<template>
  <div
    class="prose max-w-none"
    :class="panelMode ? 'prose-sm' : 'prose-base'"
    style="
      --tw-prose-body: var(--color-text);
      --tw-prose-headings: var(--color-text);
      --tw-prose-links: var(--color-accent);
      --tw-prose-bold: var(--color-text);
      --tw-prose-code: var(--color-text);
      --tw-prose-quotes: var(--color-text-sec);
      --tw-prose-hr: var(--color-border);
      --tw-prose-bullets: var(--color-text-muted);
      --tw-prose-counters: var(--color-text-muted);
    "
  >
    <component :is="currentContent" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AboutEn from '@/content/about.en.md'
import AboutIt from '@/content/about.it.md'

defineProps({
  panelMode: {
    type: Boolean,
    default: false,
  },
})

const { locale } = useI18n()

const currentContent = computed(() => {
  return locale.value === 'it' ? AboutIt : AboutEn
})
</script>
