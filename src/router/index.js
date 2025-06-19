import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'

import DefaultLayout from '@/views/DefaultLayout.vue'
import GuestLayout from '@/views/GuestLayout.vue'

import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import VerifyEmail from '@/pages/VerifyEmail.vue'
import PremiumPage from '@/pages/PremiumPage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import ContactPage from '@/pages/ContactPage.vue'

import TodoPage from '@/pages/TodoPage.vue'
import UserProfile from '@/pages/UserProfile.vue'
import UserSettings from '@/pages/UserSettings.vue'
// import MyImages from '@/pages/MyImages.vue'
// import UpLoad from '@/pages/UpLoad.vue'
// import MyAlbums from '@/pages/MyAlbums.vue'
// import ReSize from '@/pages/ReSize.vue'

import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/',
    component: GuestLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: '/',
        name: 'Home',
        meta: { requiresAuth: false, showInNav: false },
        component: HomePage,
      },
      {
        path: '/login',
        name: 'Login',
        meta: { requiresAuth: false, showInNav: false, guest: true },
        component: LoginPage,
      },
      {
        path: '/register',
        name: 'Register',
        meta: { requiresAuth: false, showInNav: false, guest: true },
        component: RegisterPage,
      },
      {
        path: '/VerifyEmail',
        name: 'VerifyEmail',
        meta: { requiresAuth: false, showInNav: false },
        component: VerifyEmail,
      },
      {
        path: '/premium',
        name: 'Premium',
        meta: { requiresAuth: false, showInNav: true },
        component: PremiumPage,
      },
      {
        path: '/about',
        name: 'About',
        meta: { requiresAuth: false, showInNav: true },
        component: AboutPage,
      },
      {
        path: '/contact',
        name: 'Contact',
        meta: { requiresAuth: false, showInNav: true },
        component: ContactPage,
      },
    ],
  },
  {
    path: '/dashboard',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/todo',
        name: 'Todo',
        meta: { requiresAuth: true, showInNav: true },
        component: TodoPage,
      },
      {
        path: '/user',
        name: 'User',
        meta: { requiresAuth: true, showInNav: false },
        component: UserProfile,
      },
      {
        path: '/setting',
        name: 'Setting',
        meta: { requiresAuth: true, showInNav: false },
        component: UserSettings,
      },
      // { path: '/myimages', name: 'MyImages', component: MyImages },
      // { path: '/upload', name: 'Upload', component: UpLoad },
      // { path: '/myalbums', name: 'MyAlbums', component: MyAlbums },
      // { path: '/resize', name: 'Resize', component: ReSize },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { showInNav: false },
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware globale
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Se l'utente non è ancora caricato, proviamo a caricarlo
  if (!userStore.isUserLoaded) {
    try {
      await userStore.fetchUser()
    } catch {
      // Ignora errori, utente rimane null
    }
  }

  const isLoggedIn = !!userStore.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Se non autenticato e prova ad accedere a pagina protetta
    return next({ name: 'Login' })
  }

  if (to.meta.guest && isLoggedIn) {
    // Se utente loggato e tenta di accedere a login o register
    return next({ name: 'Todo' }) // o dashboard a tua scelta
  }

  next()
})

function flattenRoutes(routes) {
  return routes.flatMap((route) => (route.children ? flattenRoutes(route.children) : [route]))
}

const flatRoutes = flattenRoutes(routes)

export { router, routes, flatRoutes }
