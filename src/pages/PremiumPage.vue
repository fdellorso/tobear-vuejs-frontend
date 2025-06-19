<template>
  <BentoGrids></BentoGrids>
  <PricingSection></PricingSection>
  <FeatureSection :features="features">
    <template v-slot:title>Everything you need to deploy your app</template>
    <template v-slot:content>
      Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a
      elementum pulvinar et feugiat blandit at. In mi viverra elit nunc.
    </template>
  </FeatureSection>
</template>

<script setup>
import BentoGrids from '@/components/tailwindplus/BentoGrids.vue'
import FeatureSection from '@/components/tailwindplus/FeatureSection.vue'
import PricingSection from '@/components/tailwindplus/PricingSection.vue'

const features = [
  {
    name: 'Push to deploy',
    description:
      'Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.',
    icon: 'LockClosed',
  },
  {
    name: 'SSL certificates',
    description:
      'Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.',
    icon: 'LockClosed',
  },
  {
    name: 'Simple queues',
    description:
      'Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.',
    icon: 'LockClosed',
  },
  {
    name: 'Advanced security',
    description:
      'Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.',
    icon: 'LockClosed',
  },
]
</script>

<style scoped></style>
