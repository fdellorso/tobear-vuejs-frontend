<script setup>
import HeroIcon from '@/components/HeroIcon.vue'

const technologies = [
  {
    title: 'Vue 3 + Composition API',
    description: 'For building reactive user interfaces using a clean and modular structure.',
    icon: 'PuzzlePiece',
  },
  {
    title: 'Vite',
    description:
      'A fast development server and build tool that significantly speeds up development.',
    icon: 'Bolt',
  },
  {
    title: 'Tailwind CSS',
    description: 'For utility-first styling with full design flexibility and responsive support.',
    icon: 'PaintBrush',
  },
  {
    title: 'VueDraggable (vuedraggable@next)',
    description: 'To provide smooth drag-and-drop functionality for task reordering.',
    icon: 'ArrowsUpDown',
  },
  {
    title: 'Axios',
    description: 'To handle HTTP requests to the backend API.',
    icon: 'GlobeAlt',
  },
  {
    title: 'Laravel 12 (API)',
    description:
      'A powerful PHP backend used to manage tasks, user authentication, and data persistence.',
    icon: 'Cube',
  },
  {
    title: 'MySQL',
    description: 'As the relational database for storing users, tasks, and ordering information.',
    icon: 'CircleStack',
  },
  {
    title: 'JWT Authentication',
    description: 'For secure, stateless user authentication across the frontend and backend.',
    icon: 'LockClosed',
  },
  {
    title: 'PWA',
    description: 'future',
    icon: 'LockClosed',
  },
  {
    title: 'Next',
    description: '.Future',
    icon: 'LockClosed',
  },
]

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

<template>
  <div class="h-screen overflow-auto snap-y snap-mandatory">
    <div class="relative isolate px-6 pt-14 lg:px-8 h-screen snap-start snap-always">
      <div class="mx-auto max-w-2xl">
        <!-- <div class="hidden sm:mb-8 sm:flex sm:justify-center">
        <div
          class="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
        >
          Announcing our next round of funding.
          <a href="#" class="font-semibold text-indigo-600"
            ><span class="absolute inset-0" aria-hidden="true" />Read more
            <span aria-hidden="true">&rarr;</span></a
          >
        </div>
      </div> -->
        <div class="text-center">
          <h1
            class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl px-40"
          >
            Welcome to <strong>toBear</strong>
          </h1>
          <p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            a mindful way to manage your tasks. The name ToBear is inspired by the expression “to
            bear in mind”, which means to remember or consider something important. Just like the
            phrase suggests, this app helps you keep track of the things you don’t want to forget -
            your tasks, ideas, and goals - all in one place. Whether it’s something you need to do
            today or a plan for the future, ToBear is here to help you carry those thoughts with
            clarity and purpose.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >Get started</a
            >
            <a href="#" class="text-sm/6 font-semibold text-gray-900"
              >Learn more <span aria-hidden="true">→</span></a
            >
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white py-24 sm:py-32 h-screen snap-start snap-always">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center px-40">
          <h2 class="text-base/7 font-semibold text-indigo-600">Deploy faster</h2>
          <p
            class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance"
          >
            Everything you need to deploy your app
          </p>
          <p class="mt-6 text-lg/8 text-gray-600">
            Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget
            egestas a elementum pulvinar et feugiat blandit at. In mi viverra elit nunc.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl
            class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
          >
            <div v-for="feature in features" :key="feature.name" class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div
                  class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600"
                >
                  <!-- <component :is="feature.icon" class="size-6 text-white" aria-hidden="true" /> -->
                  <HeroIcon
                    :name="feature.icon"
                    class="size-6 text-gray-100" aria-hidden="true"
                  />
                </div>
                {{ feature.name }}
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">{{ feature.description }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div class="p-3 h-screen snap-start snap-always">
      <div class="mx-auto max-w-2xl lg:text-center px-40">
        <h2 class="text-base/7 font-semibold text-indigo-600">Deploy faster</h2>
        <p
          class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance"
        >
          Technologies Used in ToBear
        </p>
        <p class="mt-6 text-lg/8 text-gray-600">
          ToBear was built with modern web technologies focused on performance, maintainability, and
          developer productivity. The goal was to create a responsive and intuitive user experience
          while keeping the codebase clean and scalable. Here's a quick overview of the key
          technologies behind the app:
        </p>
      </div>

      <ul role="list" class="divide-y divide-gray-100">
        <li
          v-for="tool in technologies"
          :key="tool.email"
          class="flex justify-between gap-x-6 py-5"
        >
          <div class="flex min-w-0 gap-x-4">
            <HeroIcon
              :name="tool.icon"
              class="size-12 shadow-md/50 flex-none border-2 border-blue-800 rounded-full bg-blue-800 text-gray-100"
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm/6 font-semibold text-gray-900">{{ tool.title }}</p>
              <p class="mt-1 truncate text-xs/5 text-gray-500">{{ tool.description }}</p>
            </div>
          </div>
          <!-- <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
          <p class="text-sm/6 text-gray-900">{{ tool.role }}</p>
          <p v-if="tool.lastSeen" class="mt-1 text-xs/5 text-gray-500">
            Last seen <time :datetime="tool.lastSeenDateTime">{{ tool.lastSeen }}</time>
          </p>
          <div v-else class="mt-1 flex items-center gap-x-1.5">
            <div class="flex-none rounded-full bg-emerald-500/20 p-1">
              <div class="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <p class="text-xs/5 text-gray-500">Online</p>
          </div>
        </div> -->
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}
</style>
