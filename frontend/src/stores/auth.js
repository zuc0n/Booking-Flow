import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '../router';
import { apiService } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  const isAuthenticated = computed(() => !!user.value);
  const getUser = computed(() => user.value);
  const getError = computed(() => error.value);
  const isLoading = computed(() => loading.value);
  
  const register = async (userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.auth.register(userData);
      user.value = response.data.user;
      localStorage.setItem('isAuthenticated', 'true');

      router.push({ name: 'Dashboard' });
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.auth.login(credentials);
      user.value = response.data.user;
      localStorage.setItem('isAuthenticated', 'true');

      const redirectPath = router.currentRoute.value.query.redirect || '/dashboard';
      router.push(redirectPath);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    loading.value = true;
    
    try {
      await apiService.auth.logout();
      user.value = null;
      localStorage.removeItem('isAuthenticated');

      router.push({ name: 'Login' });
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Logout failed';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('isAuthenticated')) {
      return false;
    }

    loading.value = true;
    
    try {
      const response = await apiService.auth.getCurrentUser();
      user.value = response.data.user;
      return true;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        user.value = null;
      }
      error.value = err.response?.data?.message || 'Failed to fetch user data';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const clearError = () => {
    error.value = null;
  };
  
  return {
    user,
    loading,
    error,
    
    isAuthenticated,
    getUser,
    getError,
    isLoading,
    
    register,
    login,
    logout,
    fetchCurrentUser,
    clearError
  };
});