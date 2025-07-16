<template>
  <div class="confirmation-container">
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
      <div class="progress-step completed">
        <div class="step-number">3</div>
        <div class="step-label">Contact Details</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step active">
        <div class="step-number">4</div>
        <div class="step-label">Confirmation</div>
      </div>
    </div>

    <div v-if="bookingDetails" class="confirmation-content">
      <div class="confirmation-header">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 class="confirmation-title">Your booking has been confirmed!</h1>
        <p class="confirmation-subtitle">Thank you for your booking. We've sent a confirmation email to {{ bookingDetails.contact.email }}</p>
        <div class="reference-number">
          <span>Booking Reference:</span>
          <strong>{{ bookingDetails.reference }}</strong>
        </div>
      </div>

      <div class="booking-details-card">
        <h2 class="details-title">Booking Details</h2>

        <div class="details-grid">
          <div class="details-section">
            <h3 class="section-title">Room Information</h3>
            <div class="room-info">
              <img
                  :src="bookingDetails.roomId.imageUrl"
                  :alt="bookingDetails.roomId.title"
                  class="room-image"
              />
              <div class="room-details">
                <h4 class="room-title">{{ bookingDetails.roomId.title }}</h4>
                <p class="room-price">{{ formatPrice(bookingDetails.roomId.price) }} per night</p>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3 class="section-title">Guest Information</h3>
            <table class="details-table">
              <tr>
                <td>Name:</td>
                <td>{{ bookingDetails.contact.title }} {{ bookingDetails.contact.name }}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>{{ bookingDetails.contact.email }}</td>
              </tr>
              <tr>
                <td>Guests:</td>
                <td>{{ bookingDetails.guests }} {{ bookingDetails.guests === 1 ? 'guest' : 'guests' }}</td>
              </tr>
            </table>
          </div>

          <div class="details-section">
            <h3 class="section-title">Stay Information</h3>
            <table class="details-table">
              <tr>
                <td>Check-in:</td>
                <td>{{ formatDate(bookingDetails.checkIn) }}</td>
              </tr>
              <tr>
                <td>Check-out:</td>
                <td>{{ formatDate(bookingDetails.checkOut) }}</td>
              </tr>
              <tr>
                <td>Duration:</td>
                <td>{{ bookingDetails.nights }} {{ bookingDetails.nights === 1 ? 'night' : 'nights' }}</td>
              </tr>
            </table>
          </div>

          <div class="details-section">
            <h3 class="section-title">Payment Information</h3>
            <table class="details-table payment-table">
              <tr>
                <td>Room Total:</td>
                <td>{{ formatPrice(bookingDetails.roomId.price * bookingDetails.nights) }}</td>
              </tr>
              <tr>
                <td>Tax (10%):</td>
                <td>{{ formatPrice(bookingDetails.total * 0.1) }}</td>
              </tr>
              <tr>
                <td>Service Fee (5%):</td>
                <td>{{ formatPrice(bookingDetails.total * 0.05) }}</td>
              </tr>
              <tr class="total-row">
                <td>Grand Total:</td>
                <td>{{ formatPrice(bookingDetails.total) }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="confirmation-actions">
        <button @click="goToDashboard" class="dashboard-button">View My Bookings</button>
        <button @click="goToHome" class="home-button">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '../../stores/booking';

const router = useRouter();
const bookingStore = useBookingStore();

const bookingDetails = computed(() => bookingStore.getBookingDetails);

onMounted(() => {
  if (!bookingDetails.value) {
    router.push({ name: 'Home' });
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

const goToDashboard = () => {
  router.push({ name: 'Dashboard' });
};

const goToHome = () => {
  bookingStore.clearBookingData();
  router.push({ name: 'Home' });
};
</script>

<style lang="scss" scoped>
.confirmation-container {
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

.confirmation-content {
  max-width: 900px;
  margin: 0 auto;
}

.confirmation-header {
  text-align: center;
  margin-bottom: 3rem;
  
  .success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background-color: #4caf50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 40px;
      height: 40px;
      color: white;
    }
  }
  
  .confirmation-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .confirmation-subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .reference-number {
    display: inline-block;
    background-color: #f5f5f5;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1.1rem;
    
    span {
      color: #666;
      margin-right: 0.5rem;
    }
    
    strong {
      color: #333;
      font-weight: 600;
    }
  }
}

.booking-details-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  
  .details-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #eee;
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .details-section {
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #555;
      margin-bottom: 1rem;
    }
  }
  
  .room-info {
    display: flex;
    align-items: center;
    
    .room-image {
      width: 100px;
      height: 70px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 1rem;
    }
    
    .room-details {
      .room-title {
        font-size: 1.1rem;
        font-weight: 500;
        color: #333;
        margin: 0 0 0.25rem;
      }
      
      .room-price {
        font-size: 0.95rem;
        color: #666;
        margin: 0;
      }
    }
  }
  
  .details-table {
    width: 100%;
    border-collapse: collapse;
    
    tr {
      td {
        padding: 0.5rem 0;
        font-size: 0.95rem;
        color: #666;
        
        &:first-child {
          font-weight: 500;
          width: 40%;
        }
      }
    }
    
    &.payment-table {
      .total-row {
        td {
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
          border-top: 1px solid #eee;
        }
      }
    }
  }
}

// Confirmation Actions
.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
  
  button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .dashboard-button {
    background-color: #4a90e2;
    color: white;
    border: none;
    
    &:hover {
      background-color: #3a7bc8;
    }
  }
  
  .home-button {
    background-color: transparent;
    color: #555;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
}
</style>