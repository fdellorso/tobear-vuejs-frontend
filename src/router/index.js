import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'

import DefaultLayout from '@/views/DefaultLayout.vue'
// import GuestLayout from '@/views/GuestLayout.vue'
import HomePage from '@/pages/HomePage.vue'
import LogIn from '@/pages/LogIn.vue'
// import MyImages from '@/pages/MyImages.vue'
import RegIster from '@/pages/RegIster.vue'
import NotFound from '@/pages/NotFound.vue'
// import UpLoad from '@/pages/UpLoad.vue'
import ToDo from '@/pages/ToDo.vue'
import EmailVerification from '@/pages/EmailVerification.vue'
import UserSettings from '@/pages/UserSettings.vue'
// import MyAlbums from '@/pages/MyAlbums.vue'
// import ReSize from '@/pages/ReSize.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '/', name: 'Home', component: HomePage },
      { path: '/login', name: 'Login', component: LogIn },
      { path: '/register', name: 'Register', component: RegIster },
      { path: '/emailverification', name: 'EmailVerification', component: EmailVerification },
    ],
    beforeEnter: async (to, from, next) => {
      try {
        const userStore = useUserStore()
        await userStore.fetchUser()
      } catch (error) {
        console.error(error)
      }
      next()
    },
  },
  {
    path: '/dashboard',
    component: DefaultLayout,
    children: [
      // { path: '/myimages', name: 'MyImages', component: MyImages },
      // { path: '/upload', name: 'Upload', component: UpLoad },
      // { path: '/myalbums', name: 'MyAlbums', component: MyAlbums },
      // { path: '/resize', name: 'Resize', component: ReSize },
      { path: '/todo', name: 'Todo', component: ToDo },
      { path: '/user', name: 'User', component: UserSettings },
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
