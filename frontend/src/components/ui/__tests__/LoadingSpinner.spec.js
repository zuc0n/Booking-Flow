import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '../LoadingSpinner.vue';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner);
    
    // Check if component exists
    expect(wrapper.exists()).toBe(true);
    
    // Check if it has the correct test ID
    expect(wrapper.attributes('data-testid')).toBe('loading-spinner');
    
    // Check if spinner element exists
    const spinner = wrapper.find('.loading-spinner');
    expect(spinner.exists()).toBe(true);
    
    // Check default styles (medium size)
    expect(spinner.attributes('style')).toContain('width: 36px');
    expect(spinner.attributes('style')).toContain('height: 36px');
    
    // Check default color (primary)
    expect(spinner.attributes('style')).toContain('border-top-color: #4a90e2');
    
    // Check that no text is displayed by default
    const text = wrapper.find('.loading-text');
    expect(text.exists()).toBe(false);
  });
  
  it('renders with small size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'small'
      }
    });
    
    const spinner = wrapper.find('.loading-spinner');
    expect(spinner.attributes('style')).toContain('width: 24px');
    expect(spinner.attributes('style')).toContain('height: 24px');
  });
  
  it('renders with large size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'large'
      }
    });
    
    const spinner = wrapper.find('.loading-spinner');
    expect(spinner.attributes('style')).toContain('width: 48px');
    expect(spinner.attributes('style')).toContain('height: 48px');
  });
  
  it('renders with secondary color', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        color: 'secondary'
      }
    });
    
    const spinner = wrapper.find('.loading-spinner');
    expect(spinner.attributes('style')).toContain('border-top-color: #555');
  });
  
  it('renders with custom color', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        color: '#ff0000'
      }
    });
    
    const spinner = wrapper.find('.loading-spinner');
    expect(spinner.attributes('style')).toContain('border-top-color: #ff0000');
  });
  
  it('renders with text', () => {
    const loadingText = 'Loading data...';
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: loadingText
      }
    });
    
    const text = wrapper.find('.loading-text');
    expect(text.exists()).toBe(true);
    expect(text.text()).toBe(loadingText);
  });
});