import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer Component', () => {
  it('renders the brand logo and text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    // Test if logo text is visible
    const logoElement = screen.getByAltText(/Staylix Premium Logo/i);
    expect(logoElement).toBeInTheDocument();
  });

  it('allows user to type in newsletter email input', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Find the input field by placeholder
    const emailInput = screen.getByPlaceholderText(/Exclusive membership deals/i);
    
    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Assert value changed
    expect(emailInput.value).toBe('test@example.com');
  });
});
