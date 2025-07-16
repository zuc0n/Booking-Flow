<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="navigateTo('Home')">
            <h1>Hotel Booking</h1>
          </div>

          <nav class="main-nav">
            <ul class="nav-links">
              <li><router-link :to="{ name: 'Home' }">Home</router-link></li>

              <template v-if="isAuthenticated">
                <li><router-link :to="{ name: 'Dashboard' }">My Bookings</router-link></li>
                <li>
                  <button @click="handleLogout" class="nav-button">Logout</button>
                </li>
                <li class="user-greeting">
                  Hello, {{ currentUser?.name?.split(' ')[0] || 'User' }}
                </li>
              </template>

              <template v-else>
                <li><router-link :to="{ name: 'Login' }">Login</router-link></li>
                <li><router-link :to="{ name: 'Register' }">Register</router-link></li>
              </template>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <p>&copy; {{ new Date().getFullYear() }} Hotel Booking. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.getUser);

const navigateTo = (routeName) => {
  router.push({ name: routeName });
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style lang="scss">
@use './assets/styles/variables' as *;

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  box-shadow: $box-shadow-sm;
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md 0;
  }
  
  .logo {
    cursor: pointer;
    
    h1 {
      font-size: $font-size-larger;
      font-weight: $font-weight-bold;
      color: $primary-color;
      margin: 0;
    }
  }
  
  .main-nav {
    .nav-links {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
      margin: 0;
      padding: 0;
      list-style: none;
      
      li {
        a {
          color: $text-color;
          text-decoration: none;
          font-weight: $font-weight-medium;
          transition: $transition-base;
          
          &:hover, &.router-link-active {
            color: $primary-color;
          }
        }
      }
      
      .user-greeting {
        margin-left: $spacing-md;
        font-weight: $font-weight-medium;
        color: $text-color-lightest;
      }
    }
  }
  
  @media (max-width: $breakpoint-md) {
    .header-content {
      flex-direction: column;
      gap: $spacing-sm;
      padding: $spacing-sm 0;
    }
    
    .main-nav .nav-links {
      gap: $spacing-md;
      
      .user-greeting {
        display: none;
      }
    }
  }
  
  @media (max-width: $breakpoint-sm) {
    .main-nav .nav-links {
      gap: $spacing-sm;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}

.app-main {
  flex: 1;
}

.app-footer {
  background-color: $background-color;
  border-top: 1px solid $border-color-light;
  padding: $spacing-lg 0;
  margin-top: $spacing-xxl;
  
  .footer-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .footer-info {
    p {
      margin: 0;
      color: $text-color-light;
      font-size: $font-size-small;
    }
  }
  
  @media (max-width: $breakpoint-md) {
    .footer-content {
      flex-direction: column;
      gap: $spacing-md;
      text-align: center;
    }
    
    .footer-links ul {
      justify-content: center;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
