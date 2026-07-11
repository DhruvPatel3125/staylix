import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../pages/Auth/Register';
import useAuth from '../../../hooks/useAuth';

// Mock dependencies
vi.mock('../../../hooks/useAuth', () => ({
  default: vi.fn()
}));

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login-mock">Google Login</div>,
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Component - Comprehensive Tests', () => {
  const mockRegister = vi.fn();
  const mockClearErrors = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      googleAuth: vi.fn(),
      verifyOTP: vi.fn(),
      error: null,
      clearErrors: mockClearErrors,
    });
  });

  it('1. should render all registration fields and buttons correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('2. should allow typing in name, email, and password fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('3. should block submission if validation fails (empty fields)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Register/i });
    await user.click(submitBtn);

    // Validation should prevent API call
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('4. should call register function with FormData when valid details are submitted', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({}); // Simulate success

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    const submitBtn = screen.getByRole('button', { name: /Register/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
      
      // Since it's passed as FormData, we check if the mock was called
      // We could extract the FormData object to check its contents, but checking if it was called is enough for now.
      const formDataArg = mockRegister.mock.calls[0][0];
      expect(formDataArg instanceof FormData).toBe(true);
      expect(formDataArg.get('name')).toBe('John Doe');
      expect(formDataArg.get('email')).toBe('john@example.com');
    });
  });

  it('5. should display error message if API registration fails', async () => {
    const user = userEvent.setup();
    const errorMsg = 'Email already exists';
    mockRegister.mockRejectedValueOnce({ message: errorMsg });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    const submitBtn = screen.getByRole('button', { name: /Register/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });
});

