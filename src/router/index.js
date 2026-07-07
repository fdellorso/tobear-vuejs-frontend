import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'

import AppLayout from '@/views/AppLayout.vue'

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
        component: () => import('@/pages/TodoPage.vue'),
      },
      {
        path: '/about',
        name: 'About',
        meta: { requiresAuth: false, showInNav: true },
        component: () => import('@/pages/AboutPage.vue'),
      },
      {
        path: '/contact',
        name: 'Contact',
        meta: { requiresAuth: false, showInNav: true },
        component: () => import('@/pages/ContactPage.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        meta: { requiresAuth: false, showInNav: false, guest: true },
        component: () => import('@/pages/LoginPage.vue'),
      },
      {
        path: '/register',
        name: 'Register',
        meta: { requiresAuth: false, showInNav: false, guest: true },
        component: () => import('@/pages/RegisterPage.vue'),
      },
      {
        path: '/verifyemail',
        name: 'VerifyEmail',
        meta: { requiresAuth: false, showInNav: false },
        component: () => import('@/pages/VerifyEmail.vue'),
      },
      {
        path: '/premium',
        name: 'Premium',
        meta: { requiresAuth: false, showInNav: false },
        component: () => import('@/pages/PremiumPage.vue'),
      },
      {
        path: '/user',
        name: 'User',
        meta: { requiresAccount: true, showInNav: false },
        component: () => import('@/pages/UserProfile.vue'),
      },
      {
        path: '/setting',
        name: 'Setting',
        meta: { requiresAccount: true, showInNav: false },
        component: () => import('@/pages/UserSettings.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { showInNav: false },
    component: () => import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Middleware globale
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false'

  if (!authEnabled && (to.path === '/login' || to.path === '/register')) {
    return next({ name: 'Todo' })
  }

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
