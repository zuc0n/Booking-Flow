<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Log In to Your Account</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="generalError" class="error-message general-error">
          {{ generalError }}
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter your email address"
              :class="{ 'error-input': formErrors.email }"
          />
          <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="Enter your password"
              :class="{ 'error-input': formErrors.password }"
          />
          <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
        </div>

        <button
            type="submit"
            class="auth-button"
            :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Logging In...' : 'Log In' }}
        </button>

        <div class="auth-links">
          <p>Don't have an account? <router-link to="/auth/register">Create Account</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const formData = reactive({
  email: '',
  password: ''
});

const formErrors = reactive({
  email: '',
  password: ''
});

const isSubmitting = ref(false);
const generalError = ref('');

const validateForm = () => {
  let isValid = true;
  
  formErrors.email = '';
  formErrors.password = '';
  generalError.value = '';
  
  if (!formData.email.trim()) {
    formErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    formErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  if (!formData.password) {
    formErrors.password = 'Password is required';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    const success = await authStore.login({
      email: formData.email,
      password: formData.password
    });
    
    if (success) {
      const redirectPath = route.query.redirect || '/dashboard';
      router.push(redirectPath);
    } else {
      generalError.value = authStore.getError || 'Login failed. Please check your credentials and try again.';
    }
  } catch (error) {
    generalError.value = 'An unexpected error occurred. Please try again.';
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>


<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.auth-title {
  margin-bottom: 2rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: border-color 0.2s;
      
      &:focus {
        outline: none;
        border-color: #4a90e2;
      }
      
      &.error-input {
        border-color: #e74c3c;
      }
    }
  }
  
  .error-message {
    display: block;
    margin-top: 0.5rem;
    color: #e74c3c;
    font-size: 0.875rem;
    
    &.general-error {
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background-color: rgba(231, 76, 60, 0.1);
      border-radius: 4px;
      text-align: center;
    }
  }
  
  .auth-button {
    width: 100%;
    padding: 0.875rem;
    margin-top: 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    background-color: #4a90e2;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a7bc8;
    }
    
    &:disabled {
      background-color: #a0c1e8;
      cursor: not-allowed;
    }
  }
  
  .auth-links {
    margin-top: 1.5rem;
    text-align: center;
    
    a {
      color: #4a90e2;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>