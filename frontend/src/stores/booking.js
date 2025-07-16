import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import router from '../router';
import { apiService } from '../services/api';

export const useBookingStore = defineStore('booking', () => {
  const searchParams = reactive({
    guests: 1,
    checkIn: null,
    checkOut: null
  });
  
  const selectedRoom = ref(null);
  
  const contactInfo = reactive({
    title: 'Mr',
    name: '',
    email: ''
  });
  
  const bookingDetails = ref(null);
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  const getSearchParams = computed(() => searchParams);
  const getSelectedRoom = computed(() => selectedRoom.value);
  const getContactInfo = computed(() => contactInfo);
  const getBookingDetails = computed(() => bookingDetails.value);
  const getBookings = computed(() => bookings.value);
  
  const getUpcomingBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'upcoming')
  );
  
  const getPastBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'past')
  );
  
  const getCancelledBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'cancelled')
  );
  
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  
  const getNights = computed(() => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0;
    
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  });
  
  const getTotalPrice = computed(() => {
    if (!selectedRoom.value) return 0;
    
    return selectedRoom.value.price * getNights.value;
  });
  
  const setSearchParams = (params) => {
    Object.assign(searchParams, params);
  };
  
  const setSelectedRoom = (room) => {
    selectedRoom.value = room;
  };
  
  const setContactInfo = (info) => {
    Object.assign(contactInfo, info);
  };
  
  const clearBookingData = () => {
    searchParams.guests = 1;
    searchParams.checkIn = null;
    searchParams.checkOut = null;
    
    selectedRoom.value = null;
    
    contactInfo.title = 'Mr';
    contactInfo.name = '';
    contactInfo.email = '';
    
    bookingDetails.value = null;
  };
  
  const searchRooms = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.rooms.search(searchParams);
      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error searching for rooms';
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  const createBooking = async () => {
    if (!selectedRoom.value || !searchParams.checkIn || !searchParams.checkOut) {
      error.value = 'Missing booking information';
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookingData = {
        roomId: selectedRoom.value._id,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests,
        contactInfo: contactInfo
      };
      
      const response = await apiService.bookings.create(bookingData);
      bookingDetails.value = response.data.data;
      
      router.push({ name: 'Confirmation' });
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error creating booking';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchBookings = async (status = '') => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.bookings.getAll(status);
      bookings.value = response.data.data;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching bookings';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const cancelBooking = async (bookingId) => {
    loading.value = true;
    error.value = null;
    
    try {
      await apiService.bookings.cancel(bookingId);
      
      const index = bookings.value.findIndex(booking => booking._id === bookingId);
      if (index !== -1) {
        bookings.value[index].status = 'cancelled';
      }
      
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cancelling booking';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const clearError = () => {
    error.value = null;
  };
  
  return {
    searchParams,
    selectedRoom,
    contactInfo,
    bookingDetails,
    bookings,
    loading,
    error,
    
    getSearchParams,
    getSelectedRoom,
    getContactInfo,
    getBookingDetails,
    getBookings,
    getUpcomingBookings,
    getPastBookings,
    getCancelledBookings,
    isLoading,
    getError,
    getNights,
    getTotalPrice,
    
    // Actions
    setSearchParams,
    setSelectedRoom,
    setContactInfo,
    clearBookingData,
    searchRooms,
    createBooking,
    fetchBookings,
    cancelBooking,
    clearError
  };
});