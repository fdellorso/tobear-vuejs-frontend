import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'

import AppLayout from '@/views/AppLayout.vue'

import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import VerifyEmail from '@/pages/VerifyEmail.vue'
import PremiumPage from '@/pages/PremiumPage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import ContactPage from '@/pages/ContactPage.vue'

import TodoPage from '@/pages/TodoPage.vue'
import UserProfile from '@/pages/UserProfile.vue'
import UserSettings from '@/pages/UserSettings.vue'

import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/todo',
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '/todo',
        name: 'Todo',
        meta: { showInNav: true },
        component: TodoPage,
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
        path: '/verifyemail',
        name: 'VerifyEmail',
        meta: { requiresAuth: false, showInNav: false },
        component: VerifyEmail,
      },
      {
        path: '/premium',
        name: 'Premium',
        meta: { requiresAuth: false, showInNav: false },
        component: PremiumPage,
      },
      {
        path: '/user',
        name: 'User',
        meta: { requiresAccount: true, showInNav: false },
        component: UserProfile,
      },
      {
        path: '/setting',
        name: 'Setting',
        meta: { requiresAccount: true, showInNav: false },
        component: UserSettings,
      },
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

  // Ripristina modalità salvata da localStorage
  if (userStore.mode === null) {
    userStore.loadMode()
  }

  // Tenta fetchUser solo se non siamo già in modalità guest esplicita
  if (userStore.mode !== 'guest' && !userStore.isUserLoaded) {
    try {
      await userStore.fetchUser()
    } catch {
      // Se è il primo avvio (mode ancora null), assume guest
      if (userStore.mode === null) {
        userStore.setMode('guest')
      }
    }
  }

  // Redirect utenti autenticati lontano da login/register
  if (to.meta.guest && userStore.mode === 'authenticated') {
    return next({ name: 'Todo' })
  }

  // requiresAuth / requiresAccount non sono più bloccanti —
  // le pagine mostrano un fallback interno se l'utente non è autenticato
  next()
})

export { router, routes }
