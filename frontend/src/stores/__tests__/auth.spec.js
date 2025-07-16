import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';

// Mock the router
vi.mock('../../router', () => ({
  default: {
    push: vi.fn()
  }
}));

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    auth: {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn()
    }
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    
    // Clear localStorage mock
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
  });
  
  it('should initialize with default state', () => {
    const store = useAuthStore();
    
    expect(store.user).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });
  
  it('should update isAuthenticated getter when user is set', () => {
    const store = useAuthStore();
    
    // Initially not authenticated
    expect(store.isAuthenticated).toBe(false);
    
    // Set user
    store.user = { id: '1', name: 'Test User', email: 'test@example.com' };
    
    // Now should be authenticated
    expect(store.isAuthenticated).toBe(true);
  });
  
  it('should clear error when clearError is called', () => {
    const store = useAuthStore();
    
    // Set an error
    store.error = 'Test error';
    
    // Clear error
    store.clearError();
    
    // Error should be null
    expect(store.error).toBeNull();
  });
  
  // More complex tests would test the async actions with mocked API responses
  // These would be added in a real-world scenario
});