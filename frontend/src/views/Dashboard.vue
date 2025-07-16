<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '../stores/booking';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const bookingStore = useBookingStore();
const authStore = useAuthStore();

// Check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.getUser);

// Booking data
const isLoading = ref(true);
const error = ref('');
const activeTab = ref('upcoming');

// Confirmation modal
const showCancelModal = ref(false);
const bookingToCancel = ref(null);
const isCancelling = ref(false);
const cancelError = ref('');

// Get bookings from store
const bookings = computed(() => bookingStore.getBookings);
const upcomingBookings = computed(() => bookingStore.getUpcomingBookings);
const pastBookings = computed(() => bookingStore.getPastBookings);
const cancelledBookings = computed(() => bookingStore.getCancelledBookings);

// Check authentication and fetch bookings
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push({ name: 'Login', query: { redirect: '/dashboard' } });
    return;
  }
  
  await fetchBookings();
});

// Fetch bookings from API
const fetchBookings = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await bookingStore.fetchBookings();
  } catch (err) {
    error.value = 'Error fetching bookings. Please try again.';
    console.error('Fetch bookings error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Format date for display
const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format price with currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Calculate number of nights
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

// Show cancel confirmation modal
const showCancelConfirmation = (booking) => {
  bookingToCancel.value = booking;
  showCancelModal.value = true;
  cancelError.value = '';
};

// Close cancel confirmation modal
const closeCancelModal = () => {
  showCancelModal.value = false;
  bookingToCancel.value = null;
  cancelError.value = '';
};

// Cancel booking
const cancelBooking = async () => {
  if (!bookingToCancel.value) return;
  
  isCancelling.value = true;
  cancelError.value = '';
  
  try {
    const success = await bookingStore.cancelBooking(bookingToCancel.value._id);
    
    if (success) {
      showCancelModal.value = false;
      bookingToCancel.value = null;
    } else {
      cancelError.value = bookingStore.getError || 'Error cancelling booking. Please try again.';
    }
  } catch (error) {
    cancelError.value = 'An unexpected error occurred. Please try again.';
    console.error('Cancel booking error:', error);
  } finally {
    isCancelling.value = false;
  }
};

// Change active tab
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Navigate to home
const goToHome = () => {
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">My Bookings</h1>
      <button @click="goToHome" class="new-booking-button">Book a Room</button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your bookings...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchBookings" class="retry-button">Retry</button>
    </div>
    
    <!-- No Bookings State -->
    <div v-else-if="bookings.length === 0" class="no-bookings-container">
      <div class="no-bookings-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <h2>No Bookings Found</h2>
      <p>You haven't made any bookings yet. Start by booking a room.</p>
      <button @click="goToHome" class="book-now-button">Book Now</button>
    </div>
    
    <!-- Bookings List -->
    <div v-else class="bookings-content">
      <!-- Tabs -->
      <div class="booking-tabs">
        <button 
          @click="setActiveTab('upcoming')" 
          :class="['tab-button', { active: activeTab === 'upcoming' }]"
        >
          Upcoming ({{ upcomingBookings.length }})
        </button>
        <button 
          @click="setActiveTab('past')" 
          :class="['tab-button', { active: activeTab === 'past' }]"
        >
          Past ({{ pastBookings.length }})
        </button>
        <button 
          @click="setActiveTab('cancelled')" 
          :class="['tab-button', { active: activeTab === 'cancelled' }]"
        >
          Cancelled ({{ cancelledBookings.length }})
        </button>
      </div>
      
      <!-- Upcoming Bookings -->
      <div v-if="activeTab === 'upcoming'" class="bookings-list">
        <div v-if="upcomingBookings.length === 0" class="empty-list">
          <p>You have no upcoming bookings.</p>
        </div>
        
        <div v-else class="booking-cards">
          <div v-for="booking in upcomingBookings" :key="booking._id" class="booking-card">
            <div class="booking-image">
              <img :src="booking.roomId.imageUrl" :alt="booking.roomId.title" />
            </div>
            <div class="booking-details">
              <div class="booking-header">
                <h3 class="booking-title">{{ booking.roomId.title }}</h3>
                <span class="booking-reference">Ref: {{ booking.reference }}</span>
              </div>
              
              <div class="booking-info">
                <div class="info-group">
                  <span class="info-label">Check-in:</span>
                  <span class="info-value">{{ formatDate(booking.checkIn) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Check-out:</span>
                  <span class="info-value">{{ formatDate(booking.checkOut) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Guests:</span>
                  <span class="info-value">{{ booking.guests }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Total:</span>
                  <span class="info-value price">{{ formatPrice(booking.total) }}</span>
                </div>
              </div>
              
              <div class="booking-actions">
                <button @click="showCancelConfirmation(booking)" class="cancel-button">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Past Bookings -->
      <div v-if="activeTab === 'past'" class="bookings-list">
        <div v-if="pastBookings.length === 0" class="empty-list">
          <p>You have no past bookings.</p>
        </div>
        
        <div v-else class="booking-cards">
          <div v-for="booking in pastBookings" :key="booking._id" class="booking-card">
            <div class="booking-image">
              <img :src="booking.roomId.imageUrl" :alt="booking.roomId.title" />
            </div>
            <div class="booking-details">
              <div class="booking-header">
                <h3 class="booking-title">{{ booking.roomId.title }}</h3>
                <span class="booking-reference">Ref: {{ booking.reference }}</span>
              </div>
              
              <div class="booking-info">
                <div class="info-group">
                  <span class="info-label">Check-in:</span>
                  <span class="info-value">{{ formatDate(booking.checkIn) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Check-out:</span>
                  <span class="info-value">{{ formatDate(booking.checkOut) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Guests:</span>
                  <span class="info-value">{{ booking.guests }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Total:</span>
                  <span class="info-value price">{{ formatPrice(booking.total) }}</span>
                </div>
              </div>
              
              <div class="booking-status completed">
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cancelled Bookings -->
      <div v-if="activeTab === 'cancelled'" class="bookings-list">
        <div v-if="cancelledBookings.length === 0" class="empty-list">
          <p>You have no cancelled bookings.</p>
        </div>
        
        <div v-else class="booking-cards">
          <div v-for="booking in cancelledBookings" :key="booking._id" class="booking-card">
            <div class="booking-image">
              <img :src="booking.roomId.imageUrl" :alt="booking.roomId.title" />
            </div>
            <div class="booking-details">
              <div class="booking-header">
                <h3 class="booking-title">{{ booking.roomId.title }}</h3>
                <span class="booking-reference">Ref: {{ booking.reference }}</span>
              </div>
              
              <div class="booking-info">
                <div class="info-group">
                  <span class="info-label">Check-in:</span>
                  <span class="info-value">{{ formatDate(booking.checkIn) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Check-out:</span>
                  <span class="info-value">{{ formatDate(booking.checkOut) }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Guests:</span>
                  <span class="info-value">{{ booking.guests }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">Total:</span>
                  <span class="info-value price">{{ formatPrice(booking.total) }}</span>
                </div>
              </div>
              
              <div class="booking-status cancelled">
                <span>Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Cancel Booking</h2>
          <button @click="closeCancelModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-content">
          <p>Are you sure you want to cancel your booking at <strong>{{ bookingToCancel?.roomId.title }}</strong>?</p>
          <p>Check-in: <strong>{{ formatDate(bookingToCancel?.checkIn) }}</strong></p>
          <p>This action cannot be undone.</p>
          
          <div v-if="cancelError" class="modal-error">
            {{ cancelError }}
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="closeCancelModal" class="cancel-action">No, Keep Booking</button>
          <button 
            @click="cancelBooking" 
            class="confirm-action"
            :disabled="isCancelling"
          >
            {{ isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

// Dashboard Header
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  .dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
  }
  
  .new-booking-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background-color: #4a90e2;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a7bc8;
    }
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

// Loading State
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(74, 144, 226, 0.2);
    border-top: 4px solid #4a90e2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    color: #555;
    font-size: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

// Error State
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  
  .error-message {
    color: #e74c3c;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .retry-button {
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a7bc8;
    }
  }
}

// No Bookings State
.no-bookings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  
  .no-bookings-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
    color: #aaa;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.75rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
  
  .book-now-button {
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a7bc8;
    }
  }
}

// Bookings Content
.bookings-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

// Booking Tabs
.booking-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  
  .tab-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      color: #4a90e2;
    }
    
    &.active {
      color: #4a90e2;
      border-bottom-color: #4a90e2;
    }
  }
  
  @media (max-width: 640px) {
    .tab-button {
      padding: 1rem 0.75rem;
      font-size: 0.9rem;
    }
  }
}

// Bookings List
.bookings-list {
  padding: 1.5rem;
  
  .empty-list {
    text-align: center;
    padding: 2rem 0;
    color: #666;
  }
}

// Booking Cards
.booking-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  
  .booking-image {
    width: 200px;
    height: 150px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .booking-details {
    flex: 1;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
  }
  
  .booking-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    
    .booking-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .booking-reference {
      font-size: 0.9rem;
      color: #888;
    }
  }
  
  .booking-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    .info-group {
      display: flex;
      flex-direction: column;
      
      .info-label {
        font-size: 0.85rem;
        color: #888;
        margin-bottom: 0.25rem;
      }
      
      .info-value {
        font-size: 0.95rem;
        color: #333;
        
        &.price {
          font-weight: 600;
        }
      }
    }
  }
  
  .booking-actions {
    margin-top: auto;
    
    .cancel-button {
      padding: 0.5rem 1rem;
      font-size: 0.95rem;
      color: #e74c3c;
      background-color: transparent;
      border: 1px solid #e74c3c;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: rgba(231, 76, 60, 0.1);
      }
    }
  }
  
  .booking-status {
    margin-top: auto;
    align-self: flex-start;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    
    &.completed {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }
    
    &.cancelled {
      background-color: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    .booking-image {
      width: 100%;
      height: 180px;
    }
    
    .booking-info {
      grid-template-columns: 1fr;
    }
  }
}

// Modal
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    
    &:hover {
      color: #333;
    }
  }
}

.modal-content {
  padding: 1.5rem;
  
  p {
    margin: 0 0 1rem;
    color: #555;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .modal-error {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: rgba(231, 76, 60, 0.1);
    border-radius: 4px;
    color: #e74c3c;
    font-size: 0.95rem;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  
  button {
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cancel-action {
    color: #555;
    background-color: transparent;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
  
  .confirm-action {
    color: white;
    background-color: #e74c3c;
    border: none;
    
    &:hover {
      background-color: #d62c1a;
    }
    
    &:disabled {
      background-color: #f5a7a1;
      cursor: not-allowed;
    }
  }
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
}
</style>