<template>
  <div class="room-list-container">
    <div class="progress-tracker">
      <div class="progress-step completed">
        <div class="step-number">1</div>
        <div class="step-label">Search</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step active">
        <div class="step-number">2</div>
        <div class="step-label">Select Room</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step">
        <div class="step-number">3</div>
        <div class="step-label">Contact Details</div>
      </div>
      <div class="progress-connector"></div>
      <div class="progress-step">
        <div class="step-number">4</div>
        <div class="step-label">Confirmation</div>
      </div>
    </div>

    <div class="search-header">
      <div class="search-summary">
        <div class="summary-details">
          <p>
            <strong>{{ searchParams.guests }}</strong> {{ searchParams.guests === 1 ? 'Guest' : 'Guests' }} |
            <strong>{{ nights }}</strong> {{ nights === 1 ? 'Night' : 'Nights' }} -
            <strong>{{ formatDate(searchParams.checkIn) }}</strong> to
            <strong>{{ formatDate(searchParams.checkOut) }}</strong>
          </p>
        </div>
        <button @click="goBackToSearch" class="edit-search-button">Edit Search</button>
      </div>
    </div>

    <div class="sort-container">
      <label for="sort">Sort by:</label>
      <select
          id="sort"
          :value="roomStore.getSortOption"
          @change="sortRooms($event.target.value)"
          class="sort-select"
      >
        <option value="price-asc">Lowest Price</option>
        <option value="price-desc">Highest Price</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Searching for available rooms...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="goBackToSearch" class="back-button">Back to Search</button>
    </div>

    <div v-else class="room-list">
      <div v-for="room in rooms" :key="room._id" class="room-card">
        <div class="room-image">
          <img :src="room.imageUrl" :alt="room.title" />
        </div>
        <div class="room-content">
          <h2 class="room-title">{{ room.title }}</h2>
          <p class="room-description">{{ room.description }}</p>
          <div class="room-amenities" v-if="room.amenities && room.amenities.length">
            <span v-for="(amenity, index) in room.amenities" :key="index" class="amenity-tag">
              {{ amenity }}
            </span>
          </div>
        </div>
        <div class="room-price-container">
          <div class="room-price">
            <span class="price">{{ formatPrice(room.price) }}</span>
            <span class="per-night">per night</span>
          </div>
          <div class="total-price">
            Total: {{ formatPrice(calculateTotalPrice(room.price)) }}
          </div>
          <button @click="selectRoom(room)" class="book-button">Book Room</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '../../stores/booking';
import { useRoomStore } from '../../stores/room';

const router = useRouter();
const bookingStore = useBookingStore();
const roomStore = useRoomStore();

const isLoading = ref(true);
const error = ref('');
const rooms = ref([]);

const searchParams = computed(() => bookingStore.getSearchParams);

const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const nights = computed(() => {
  if (!searchParams.value.checkIn || !searchParams.value.checkOut) return 0;
  
  const checkIn = new Date(searchParams.value.checkIn);
  const checkOut = new Date(searchParams.value.checkOut);
  
  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const calculateTotalPrice = (roomPrice) => {
  return roomPrice * nights.value;
};

const selectRoom = (room) => {
  const selectedRoom = {
    ...room,
    totalPrice: calculateTotalPrice(room.price),
    nights: nights.value
  };
  
  bookingStore.setSelectedRoom(selectedRoom);
  router.push({ name: 'ContactDetails' });
};

const searchRooms = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    if (!searchParams.value.checkIn || !searchParams.value.checkOut || !searchParams.value.guests) {
      error.value = 'Please go back and complete the search form';
      isLoading.value = false;
      return;
    }
    
    const availableRooms = await bookingStore.searchRooms();
    
    if (availableRooms.length === 0) {
      error.value = 'No rooms available for the selected dates and guest count';
    } else {
      rooms.value = availableRooms;
      roomStore.setFilteredRooms(availableRooms);
    }
  } catch (err) {
    error.value = 'Error searching for rooms. Please try again.';
    console.error('Room search error:', err);
  } finally {
    isLoading.value = false;
  }
};

const sortRooms = (option) => {
  roomStore.setSortOption(option);
  rooms.value = [...roomStore.getFilteredRooms];
};

const goBackToSearch = () => {
  router.push({ name: 'Home' });
};

onMounted(() => {
  searchRooms();
});
</script>

<style lang="scss" scoped>
.room-list-container {
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
    margin: 0 0.5rem 0 2rem;

    @media (max-width: 768px) {
      width: 30px;
    }
    
    @media (max-width: 480px) {
      width: 20px;
    }
  }
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  flex-grow: 1;
  
  .summary-details {
    p {
      margin: 0;
      font-size: 0.95rem;
      color: #555;
    }
  }
  
  .edit-search-button {
    background-color: transparent;
    color: #4a90e2;
    border: 1px solid #4a90e2;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(74, 144, 226, 0.1);
    }
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    
    .summary-details {
      margin-bottom: 1rem;
    }
  }
}

.sort-container {
  display: flex;
  align-items: center;
  margin: 0 1.5rem 1.5rem;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 1rem;
  }
  
  label {
    margin-right: 0.5rem;
    font-size: 0.95rem;
    color: #555;
  }
  
  .sort-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #4a90e2;
    }
  }
}

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
  
  .back-button {
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

.room-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.room-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  .room-image {
    flex: 0 0 250px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .room-content {
    flex: 1;
    padding: 1.5rem;
    
    .room-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.75rem;
    }
    
    .room-description {
      font-size: 0.95rem;
      color: #666;
      margin: 0 0 1rem;
      line-height: 1.5;
      
      // Limit to 3 lines
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .room-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      
      .amenity-tag {
        background-color: #f5f5f5;
        color: #555;
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
    }
  }
  
  .room-price-container {
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    border-left: 1px solid #eee;
    
    .room-price {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 0.25rem;
      
      .price {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
      }
      
      .per-night {
        font-size: 0.85rem;
        color: #777;
      }
    }
    
    .total-price {
      font-size: 0.95rem;
      color: #555;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .book-button {
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 100%;
      
      &:hover {
        background-color: #3a7bc8;
      }
    }
  }
  
  @media (max-width: 900px) {
    flex-direction: column;
    
    .room-image {
      flex: 0 0 210px;
    }
    
    .room-price-container {
      flex: 0 0 auto;
      border-left: none;
      border-top: 1px solid #eee;
    }
  }
}
</style>