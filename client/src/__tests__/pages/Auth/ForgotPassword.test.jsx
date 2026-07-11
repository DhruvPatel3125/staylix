import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../../pages/Auth/ForgotPassword';
import api from '../../../services/api';

// Mock dependencies
vi.mock('../../../services/api', () => ({
  default: {
    auth: {
      forgotPassword: vi.fn(),
      verifyResetOTP: vi.fn(),
    }
  }
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe('ForgotPassword Component - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. should render the forgot password form initially', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByText(/Enter your email and we'll send you a code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Code/i })).toBeInTheDocument();
  });

  it('2. should allow typing in email field', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('3. should block submission if email is empty (HTML5 validation)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    
    // Email input has 'required' prop, but let's test if API is not called
    const submitBtn = screen.getByRole('button', { name: /Send Reset Code/i });
    await user.click(submitBtn);

    expect(api.auth.forgotPassword).not.toHaveBeenCalled();
  });

  it('4. should call api and show success state when valid email is submitted', async () => {
    const user = userEvent.setup();
    api.auth.forgotPassword.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

    await waitFor(() => {
      expect(api.auth.forgotPassword).toHaveBeenCalledWith('test@example.com');
      // After success, it moves to step 2 (Verification)
      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.getByText(/Enter the 6-digit code sent to/i)).toBeInTheDocument();
    });
  });

  it('5. should display error alert if api fails', async () => {
    const user = userEvent.setup();
    const errorMsg = 'User not found';
    api.auth.forgotPassword.mockRejectedValueOnce({ message: errorMsg });

    // Spy on SweetAlert fire since error is shown via Swal in this component
    const Swal = await import('sweetalert2');

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email Address/i), 'wrong@example.com');
    await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

    await waitFor(() => {
      expect(Swal.default.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          text: errorMsg
        })
      );
    });
  });
});

