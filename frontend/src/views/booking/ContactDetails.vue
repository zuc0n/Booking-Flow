<template>
  <div class="contact-details-container">
    <div class="progress-tracker">
      <div class="progress-step completed">
        <div class="step-number">1</div>
        <div class="step-label">Search</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step completed">
        <div class="step-number">2</div>
        <div class="step-label">Select Room</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step active">
        <div class="step-number">3</div>
        <div class="step-label">Contact Details</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step">
        <div class="step-number">4</div>
        <div class="step-label">Confirmation</div>
      </div>
    </div>

    <div v-if="selectedRoom" class="contact-details-content">
      <div class="contact-form-container">
        <h1 class="page-title">Contact Information</h1>

        <form @submit.prevent="handleSubmit" class="contact-form">
          <div v-if="generalError" class="error-message general-error">
            {{ generalError }}
          </div>

          <div class="form-group">
            <label for="title">Title</label>
            <select
                id="title"
                v-model="contactInfo.title"
                :class="{ 'error-input': formErrors.title }"
            >
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Other">Other</option>
            </select>
            <span v-if="formErrors.title" class="error-message">{{ formErrors.title }}</span>
          </div>

          <div class="form-group">
            <label for="name">Full Name</label>
            <input
                id="name"
                v-model="contactInfo.name"
                type="text"
                placeholder="Enter your full name"
                :class="{ 'error-input': formErrors.name }"
            />
            <span v-if="formErrors.name" class="error-message">{{ formErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
                id="email"
                v-model="contactInfo.email"
                type="email"
                placeholder="Enter your email address"
                :class="{ 'error-input': formErrors.email }"
            />
            <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
          </div>

          <div class="form-actions">
            <button
                type="button"
                @click="goBackToRooms"
                class="back-button"
            >
              Back
            </button>
            <button
                type="submit"
                class="submit-button"
                :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Processing...' : 'Complete Booking' }}
            </button>
          </div>
        </form>
      </div>

      <div class="booking-summary">
        <div class="summary-card">
          <h2 class="summary-title">Booking Summary</h2>

          <div class="summary-section">
            <h3 class="section-title">Dates</h3>
            <div class="section-content">
              <p>Check-in: <strong>{{ formatDate(searchParams.checkIn) }}</strong></p>
              <p>Check-out: <strong>{{ formatDate(searchParams.checkOut) }}</strong></p>
              <p>{{ selectedRoom.nights }} {{ selectedRoom.nights === 1 ? 'night' : 'nights' }}</p>
            </div>
          </div>

          <div class="summary-section">
            <h3 class="section-title">Guests</h3>
            <div class="section-content">
              <p>{{ searchParams.guests }} {{ searchParams.guests === 1 ? 'guest' : 'guests' }}</p>
            </div>
          </div>

          <div class="summary-section">
            <h3 class="section-title">Room</h3>
            <div class="section-content room-info">
              <img :src="selectedRoom.imageUrl" :alt="selectedRoom.title" class="room-thumbnail" />
              <div>
                <h4 class="room-title">{{ selectedRoom.title }}</h4>
                <p class="room-price">{{ formatPrice(selectedRoom.price) }} per night</p>
              </div>
            </div>
          </div>

          <div class="summary-section price-breakdown">
            <div class="price-row">
              <span>Room Total ({{ selectedRoom.nights }} {{ selectedRoom.nights === 1 ? 'night' : 'nights' }})</span>
              <span>{{ formatPrice(selectedRoom.totalPrice) }}</span>
            </div>
            <div class="price-row">
              <span>Tax (10%)</span>
              <span>{{ formatPrice(calculateTax) }}</span>
            </div>
            <div class="price-row">
              <span>Service Fee (5%)</span>
              <span>{{ formatPrice(calculateServiceFee) }}</span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span>{{ formatPrice(calculateGrandTotal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '../../stores/booking';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const bookingStore = useBookingStore();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.getUser);

const selectedRoom = computed(() => bookingStore.getSelectedRoom);
const searchParams = computed(() => bookingStore.getSearchParams);

onMounted(() => {
  if (!selectedRoom.value) {
    router.push({ name: 'RoomList' });
    return;
  }
  
  if (isAuthenticated.value && currentUser.value) {
    contactInfo.name = currentUser.value.name || '';
    contactInfo.email = currentUser.value.email || '';
  }
});

const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const calculateTax = computed(() => {
  if (!selectedRoom.value) return 0;
  return selectedRoom.value.totalPrice * 0.1;
});

const calculateServiceFee = computed(() => {
  if (!selectedRoom.value) return 0;
  return selectedRoom.value.totalPrice * 0.05;
});

const calculateGrandTotal = computed(() => {
  if (!selectedRoom.value) return 0;
  return selectedRoom.value.totalPrice + calculateTax.value + calculateServiceFee.value;
});

const contactInfo = reactive({
  title: 'Mr',
  name: '',
  email: ''
});

const formErrors = reactive({
  title: '',
  name: '',
  email: ''
});

const isSubmitting = ref(false);
const generalError = ref('');

const validateForm = () => {
  let isValid = true;
  
  formErrors.title = '';
  formErrors.name = '';
  formErrors.email = '';
  generalError.value = '';
  
  if (!contactInfo.title) {
    formErrors.title = 'Please select a title';
    isValid = false;
  }
  
  if (!contactInfo.name.trim()) {
    formErrors.name = 'Name is required';
    isValid = false;
  }
  
  if (!contactInfo.email.trim()) {
    formErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(contactInfo.email)) {
    formErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    if (!isAuthenticated.value) {
      router.push({
        name: 'Login', 
        query: { redirect: router.currentRoute.value.fullPath } 
      });
      return;
    }
    
    bookingStore.setContactInfo(contactInfo);
    
    const success = await bookingStore.createBooking();
    
    if (success) {
      router.push({ name: 'Confirmation' });
    } else {
      generalError.value = bookingStore.getError || 'Error creating booking. Please try again.';
    }
  } catch (error) {
    generalError.value = 'An unexpected error occurred. Please try again.';
    console.error('Booking error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBackToRooms = () => {
  router.push({ name: 'RoomList' });
};
</script>

<style lang="scss" scoped>
.contact-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.progress-tracker {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2.5rem;
  
  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    
    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e0e0e0;
      color: #757575;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .step-label {
      font-size: 0.875rem;
      color: #757575;
      font-weight: 500;
    }
    
    &.active {
      .step-number {
        background-color: #4a90e2;
        color: white;
      }
      
      .step-label {
        color: #4a90e2;
        font-weight: 600;
      }
    }
    
    &.completed {
      .step-number {
        background-color: #4caf50;
        color: white;
      }
      
      .step-label {
        color: #4caf50;
      }
    }
  }
  
  .progress-connector {
    width: 60px;
    height: 2px;
    background-color: #e0e0e0;
    margin: 0 0.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
      width: 30px;
    }
    
    @media (max-width: 480px) {
      width: 20px;
    }
  }
}

// Contact Details Content
.contact-details-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

// Contact Form
.contact-form-container {
  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
  }
}

.contact-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    
    input, select {
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
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    
    .back-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      color: #555;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #e9e9e9;
      }
    }
    
    .submit-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
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
}

// Booking Summary
.booking-summary {
  .summary-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    position: sticky;
    top: 2rem;
    
    .summary-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .summary-section {
      margin-bottom: 1.5rem;
      
      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #555;
        margin-bottom: 0.75rem;
      }
      
      .section-content {
        p {
          margin: 0.25rem 0;
          font-size: 0.95rem;
          color: #666;
        }
      }
      
      &.price-breakdown {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }
    }
    
    .room-info {
      display: flex;
      align-items: center;
      
      .room-thumbnail {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 1rem;
      }
      
      .room-title {
        font-size: 1rem;
        font-weight: 500;
        color: #333;
        margin: 0 0 0.25rem;
      }
      
      .room-price {
        font-size: 0.9rem;
        color: #666;
        margin: 0;
      }
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
      color: #666;
      
      &.total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        font-weight: 600;
        font-size: 1.1rem;
        color: #333;
      }
    }
  }
}

// Responsive styles
@media (max-width: 900px) {
  .booking-summary {
    .summary-card {
      position: static;
    }
  }
}
</style>