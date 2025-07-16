import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Hotel Booking - Home' }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { title: 'Register', guest: true }
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { title: 'Login', guest: true }
  },
  {
    path: '/rooms',
    name: 'RoomList',
    component: () => import('../views/rooms/RoomList.vue'),
    meta: { title: 'Select Room' }
  },
  {
    path: '/booking/contact',
    name: 'ContactDetails',
    component: () => import('../views/booking/ContactDetails.vue'),
    meta: { title: 'Contact Details', requiresAuth: true }
  },
  {
    path: '/booking/confirmation',
    name: 'Confirmation',
    component: () => import('../views/booking/Confirmation.vue'),
    meta: { title: 'Booking Confirmation', requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Dashboard', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top
    return { top: 0 };
  }
});

// Navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'Hotel Booking';

  // Check if route requires authentication
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Route guard logic
  if (to.meta.requiresAuth && !isAuthenticated) {
    // If auth is required but user is not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.guest && isAuthenticated) {
    // If route is for guests only but user is authenticated
    next({ name: 'Dashboard' });
  } else {
    // Otherwise proceed normally
    next();
  }
});

export default router;