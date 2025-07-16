<template>
  <div class="home-container">
    <div class="hero-banner">
      <div class="hero-content">
        <h1>Find Your Perfect Stay</h1>
        <p>Search for rooms and book your next getaway with ease</p>
      </div>
    </div>

    <div class="search-container">
      <div class="search-card">
        <h2>Search for Rooms</h2>

        <form @submit.prevent="handleSubmit" class="search-form">
          <div v-if="generalError" class="error-message general-error">
            {{ generalError }}
          </div>

          <div class="form-group">
            <label for="guests">Number of Guests</label>
            <div class="number-input">
              <button
                  type="button"
                  @click="searchForm.guests = Math.max(1, searchForm.guests - 1)"
                  class="number-button"
              >
                -
              </button>
              <input
                  id="guests"
                  v-model.number="searchForm.guests"
                  type="number"
                  min="1"
                  max="10"
                  :class="{ 'error-input': formErrors.guests }"
              />
              <button
                  type="button"
                  @click="searchForm.guests = Math.min(10, searchForm.guests + 1)"
                  class="number-button"
              >
                +
              </button>
            </div>
            <span v-if="formErrors.guests" class="error-message">{{ formErrors.guests }}</span>
          </div>

          <div class="form-group">
            <label for="checkIn">Check-in Date</label>
            <input
                id="checkIn"
                v-model="searchForm.checkIn"
                type="date"
                :min="todayFormatted"
                :class="{ 'error-input': formErrors.checkIn }"
            />
            <span v-if="formErrors.checkIn" class="error-message">{{ formErrors.checkIn }}</span>
          </div>

          <div class="form-group">
            <label for="checkOut">Check-out Date</label>
            <input
                id="checkOut"
                v-model="searchForm.checkOut"
                type="date"
                :min="minCheckOutDate"
                :class="{ 'error-input': formErrors.checkOut }"
            />
            <span v-if="formErrors.checkOut" class="error-message">{{ formErrors.checkOut }}</span>
          </div>

          <button
              type="submit"
              class="search-button"
              :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Searching...' : 'Search for Rooms' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '../stores/booking';

const router = useRouter();
const bookingStore = useBookingStore();

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const todayFormatted = formatDate(today);
const tomorrowFormatted = formatDate(tomorrow);

const searchForm = reactive({
  guests: 1,
  checkIn: todayFormatted,
  checkOut: tomorrowFormatted
});

const formErrors = reactive({
  guests: '',
  checkIn: '',
  checkOut: ''
});

const isSubmitting = ref(false);
const generalError = ref('');

const minCheckOutDate = computed(() => {
  if (!searchForm.checkIn) return tomorrowFormatted;
  
  const checkInDate = new Date(searchForm.checkIn);
  const nextDay = new Date(checkInDate);
  nextDay.setDate(checkInDate.getDate() + 1);
  
  return formatDate(nextDay);
});

const validateForm = () => {
  let isValid = true;
  
  formErrors.guests = '';
  formErrors.checkIn = '';
  formErrors.checkOut = '';
  generalError.value = '';
  
  if (!searchForm.guests || searchForm.guests < 1) {
    formErrors.guests = 'At least 1 guest is required';
    isValid = false;
  } else if (searchForm.guests > 10) {
    formErrors.guests = 'Maximum 10 guests allowed';
    isValid = false;
  }
  
  if (!searchForm.checkIn) {
    formErrors.checkIn = 'Check-in date is required';
    isValid = false;
  } else {
    const checkInDate = new Date(searchForm.checkIn);
    if (checkInDate < today) {
      formErrors.checkIn = 'Check-in date cannot be in the past';
      isValid = false;
    }
  }
  
  if (!searchForm.checkOut) {
    formErrors.checkOut = 'Check-out date is required';
    isValid = false;
  } else if (searchForm.checkIn) {
    const checkInDate = new Date(searchForm.checkIn);
    const checkOutDate = new Date(searchForm.checkOut);
    
    if (checkOutDate <= checkInDate) {
      formErrors.checkOut = 'Check-out date must be after check-in date';
      isValid = false;
    }
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    bookingStore.setSearchParams({
      guests: searchForm.guests,
      checkIn: searchForm.checkIn,
      checkOut: searchForm.checkOut
    });
    
    router.push({ name: 'RoomList' });
  } catch (error) {
    generalError.value = 'An error occurred. Please try again.';
    console.error('Search error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>


<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.hero-banner {
  height: 400px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  
  .hero-content {
    max-width: 800px;
    padding: 0 2rem;
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }
    
    p {
      font-size: 1.25rem;
      opacity: 0.9;
    }
  }
}

.search-container {
  max-width: 600px;
  margin: -60px auto 3rem;
  padding: 0 1.5rem;
}

.search-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
  }
}

.search-form {
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
  
  .number-input {
    display: flex;
    align-items: center;
    
    input {
      width: 80px;
      text-align: center;
      border-radius: 0;
      -moz-appearance: textfield;
      
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
    
    .number-button {
      width: 40px;
      height: 42px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      
      &:last-child {
        border-radius: 0 4px 4px 0;
      }
      
      &:hover {
        background-color: #e9e9e9;
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
  
  .search-button {
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
}

@media (max-width: 768px) {
  .hero-banner {
    height: 300px;
    
    .hero-content {
      h1 {
        font-size: 2rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
  }
  
  .search-container {
    margin-top: -40px;
  }
  
  .search-card {
    padding: 1.5rem;
  }
}
</style>