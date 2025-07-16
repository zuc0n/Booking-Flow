import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api';

export const useRoomStore = defineStore('room', () => {
  const rooms = ref([]);
  const filteredRooms = ref([]);
  const currentRoom = ref(null);
  const sortOption = ref('price-asc'); // 'price-asc' or 'price-desc'
  const loading = ref(false);
  const error = ref(null);
  
  const getRooms = computed(() => rooms.value);
  const getFilteredRooms = computed(() => filteredRooms.value);
  const getCurrentRoom = computed(() => currentRoom.value);
  const getSortOption = computed(() => sortOption.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  
  const applySort = (roomsArray) => {
    if (sortOption.value === 'price-asc') {
      roomsArray.sort((a, b) => a.price - b.price);
    } else if (sortOption.value === 'price-desc') {
      roomsArray.sort((a, b) => b.price - a.price);
    }
  };
  
  const fetchAllRooms = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.rooms.getAll();
      rooms.value = response.data.data;
      applySort(rooms.value);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching rooms';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchRoomById = async (roomId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiService.rooms.getById(roomId);
      currentRoom.value = response.data.data;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching room details';
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const setFilteredRooms = (roomsData) => {
    filteredRooms.value = [...roomsData];
    applySort(filteredRooms.value);
  };
  
  const setSortOption = (option) => {
    sortOption.value = option;
    applySort(filteredRooms.value);
  };
  
  const clearRoomData = () => {
    currentRoom.value = null;
  };
  
  const clearError = () => {
    error.value = null;
  };
  
  return {
    rooms,
    filteredRooms,
    currentRoom,
    sortOption,
    loading,
    error,
    getRooms,
    getFilteredRooms,
    getCurrentRoom,
    getSortOption,
    isLoading,
    getError,
    fetchAllRooms,
    fetchRoomById,
    setFilteredRooms,
    setSortOption,
    applySort,
    clearRoomData,
    clearError
  };
});