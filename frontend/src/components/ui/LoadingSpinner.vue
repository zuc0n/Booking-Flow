<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  text: {
    type: String,
    default: ''
  }
});

const spinnerSize = computed(() => {
  switch (props.size) {
    case 'small':
      return '24px';
    case 'large':
      return '48px';
    default:
      return '36px';
  }
});

const spinnerColor = computed(() => {
  switch (props.color) {
    case 'primary':
      return '#4a90e2';
    case 'secondary':
      return '#555';
    case 'white':
      return '#ffffff';
    default:
      return props.color;
  }
});
</script>

<template>
  <div class="loading-spinner-container" data-testid="loading-spinner">
    <div 
      class="loading-spinner" 
      :style="{ 
        width: spinnerSize, 
        height: spinnerSize,
        borderTopColor: spinnerColor
      }"
    ></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: inline-block;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #555;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>