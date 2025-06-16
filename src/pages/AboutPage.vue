<template>
  <FeatureSection :features="features">
    <template v-slot:title>Technologies Used in ToBear</template>
    <template v-slot:content>
      ToBear was built with modern web technologies focused on performance, maintainability, and
      developer productivity. The goal was to create a responsive and intuitive user experience
      while keeping the codebase clean and scalable. Here's a quick overview of the key technologies
      behind the app:
    </template>
  </FeatureSection>
</template>

<script setup>
import FeatureSection from '@/components/tailwindplus/FeatureSection.vue'

const features = [
  {
    name: 'Vue 3 + Composition API',
    description: 'For building reactive user interfaces using a clean and modular structure.',
    icon: 'PuzzlePiece',
  },
  {
    name: 'Vite',
    description:
      'A fast development server and build tool that significantly speeds up development.',
    icon: 'Bolt',
  },
  {
    name: 'Tailwind CSS',
    description: 'For utility-first styling with full design flexibility and responsive support.',
    icon: 'PaintBrush',
  },
  {
    name: 'VueDraggable (vuedraggable@next)',
    description: 'To provide smooth drag-and-drop functionality for task reordering.',
    icon: 'ArrowsUpDown',
  },
  {
    name: 'Axios',
    description: 'To handle HTTP requests to the backend API.',
    icon: 'GlobeAlt',
  },
  {
    name: 'Laravel 12 (API)',
    description:
      'A powerful PHP backend used to manage tasks, user authentication, and data persistence.',
    icon: 'Cube',
  },
  {
    name: 'MySQL',
    description: 'As the relational database for storing users, tasks, and ordering information.',
    icon: 'CircleStack',
  },
  {
    name: 'JWT Authentication',
    description: 'For secure, stateless user authentication across the frontend and backend.',
    icon: 'LockClosed',
  },
  {
    name: 'PWA',
    description: 'future',
    icon: 'LockClosed',
  },
  {
    name: 'Next',
    description: '.Future',
    icon: 'LockClosed',
  },
]
</script>

<style scoped></style>
