import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../pages/Auth/Login';
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

describe('Login Component - Comprehensive Tests', () => {
  const mockLogin = vi.fn();
  const mockClearErrors = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    useAuth.mockReturnValue({
      login: mockLogin,
      googleAuth: vi.fn(),
      verifyOTP: vi.fn(),
      error: null,
      clearErrors: mockClearErrors,
    });
  });

  it('1. should render all input fields and buttons correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Check placeholders and labels
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  });

  it('2. should allow typing in email and password fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('3. should show validation errors if fields are empty on submit', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    // Since the component uses Joi validation, it should block submission
    // and mockLogin should NOT be called.
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('4. should call login function when valid credentials are submitted', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({}); // Simulate successful API call

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('5. should display error message if API login fails', async () => {
    const user = userEvent.setup();
    const errorMsg = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({ message: errorMsg });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpass');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    // Wait for error to appear on screen
    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });
});

