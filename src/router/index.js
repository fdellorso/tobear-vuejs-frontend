import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'

import DefaultLayout from '@/views/DefaultLayout.vue'
import HomePage from '@/pages/HomePage.vue'
import LogIn from '@/pages/LogIn.vue'
import MyImages from '@/pages/MyImages.vue'
import RegIster from '@/pages/RegIster.vue'
import NotFound from '@/pages/NotFound.vue'
import UpLoad from '@/pages/UpLoad.vue'

const routes = [
  {
    path: '/dashboard',
    component: DefaultLayout,
    children: [
      { path: '/myimages', name: 'MyImages', component: MyImages },
      { path: '/upload', name: 'Upload', component: UpLoad },
    ],
    beforeEnter: async (to, from, next) => {
      try {
        const userStore = useUserStore()
        await userStore.fetchUser()
        next()
      } catch (error) {
        console.error(error)
        next(false)
      }
    },
  },
  { path: '/', name: 'Home', component: HomePage },
  {
    path: '/login',
    name: 'Login',
    component: LogIn,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegIster,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
