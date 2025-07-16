import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/global.scss'
import { apiService } from './services/api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Make API service available globally
app.config.globalProperties.$api = apiService

// Initialize the app
const initApp = async () => {
  const authStore = useAuthStore()

  if (localStorage.getItem('isAuthenticated')) {
    try {
      // First try to get current user
      await authStore.fetchCurrentUser()
    } catch (error) {
      // If that fails, try to refresh the token
      try {
        await apiService.auth.refreshToken()
        // After refresh, try to get user again
        await authStore.fetchCurrentUser()
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError)
        // Only clear auth state for actual auth errors (401/403)
        // Don't clear for network errors or server issues
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          localStorage.removeItem('isAuthenticated')
        }
      }
    }
  }

  // Mount the app
  app.mount('#app')
}

initApp()
