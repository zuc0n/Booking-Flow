<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="not-found-icon">404</div>
      <h1 class="not-found-title">Page Not Found</h1>
      <p class="not-found-message">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div class="not-found-actions">
        <button @click="goBack" class="action-button secondary">
          Go Back
        </button>
        <button @click="goHome" class="action-button primary">
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.not-found-card {
  width: 100%;
  max-width: 600px;
  padding: 3rem 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-icon {
  font-size: 6rem;
  font-weight: 700;
  color: #4a90e2;
  margin-bottom: 1rem;
  line-height: 1;
}

.not-found-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.not-found-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background-color: #4a90e2;
    color: white;
    
    &:hover {
      background-color: #3a7bc8;
    }
  }
  
  &.secondary {
    background-color: #f1f1f1;
    color: #555;
    
    &:hover {
      background-color: #e5e5e5;
    }
  }
}

@media (max-width: 480px) {
  .not-found-icon {
    font-size: 4rem;
  }
  
  .not-found-title {
    font-size: 1.5rem;
  }
  
  .not-found-message {
    font-size: 1rem;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>