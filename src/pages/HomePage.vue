<template>
  <HeroSection :showNav="showNav" :navigation="navigation" :navigationRoutes="navigationRoutes">
    <template v-slot:logo>
      <LoGo customClass="h-8" />
    </template>
    <template v-slot:announce> </template>
    <template v-slot:title>Welcome to <strong>toBear</strong></template>
    <template v-slot:content>
      a mindful way to manage your tasks. The name ToBear is inspired by the expression “to bear in
      mind”, which means to remember or consider something important. Just like the phrase suggests,
      this app helps you keep track of the things you don't want to forget - your tasks, ideas, and
      goals - all in one place. Whether it's something you need to do today or a plan for the
      future, ToBear is here to help you carry those thoughts with clarity and purpose.
    </template>
  </HeroSection>
</template>

<script setup>
import HeroSection from '@/components/tailwindplus/HeroSection.vue'
import LoGo from '@/components/LoGo.vue'
import { flatRoutes } from '@/router'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const navigation = flatRoutes
  .filter((route) => route.meta?.showInNav)
  .map((route) => ({ name: route.name, href: route.path }))

const navigationRoutes = {
  home: flatRoutes.find((route) => route.name === 'Home')?.path,
  login: flatRoutes.find((route) => route.name === 'Login')?.path,
  about: flatRoutes.find((route) => route.name === 'About')?.path,
  premium: flatRoutes.find((route) => route.name === 'Premium')?.path,
}

const route = useRoute()

const showNav = computed(() => !route.meta?.hideNav)
</script>

<style scoped></style>
