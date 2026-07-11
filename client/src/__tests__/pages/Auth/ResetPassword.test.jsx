import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPassword from '../../../pages/Auth/ResetPassword';
import api from '../../../services/api';

// Mock dependencies
vi.mock('../../../services/api', () => ({
  default: {
    auth: {
      resetPassword: vi.fn(),
    }
  }
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

describe('ResetPassword Component - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/reset-password/test-token-123']}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. should render the reset password form correctly', () => {
    renderComponent();

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('2. should allow typing in password fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const passInput = screen.getByLabelText('New Password');
    const confirmInput = screen.getByLabelText('Confirm New Password');

    await user.type(passInput, 'newpass123');
    await user.type(confirmInput, 'newpass123');

    expect(passInput).toHaveValue('newpass123');
    expect(confirmInput).toHaveValue('newpass123');
  });

  it('3. should show error alert if passwords do not match', async () => {
    const user = userEvent.setup();
    const Swal = await import('sweetalert2');
    renderComponent();

    await user.type(screen.getByLabelText('New Password'), 'newpass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'differentpass');
    
    await user.click(screen.getByRole('button', { name: /Reset Password/i }));

    expect(api.auth.resetPassword).not.toHaveBeenCalled();
    expect(Swal.default.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        text: 'Passwords do not match'
      })
    );
  });

  it('4. should call api and show success state when valid and matching passwords are submitted', async () => {
    const user = userEvent.setup();
    api.auth.resetPassword.mockResolvedValueOnce({});
    
    renderComponent();

    await user.type(screen.getByLabelText('New Password'), 'newpass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    
    await user.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(api.auth.resetPassword).toHaveBeenCalledWith('test-token-123', 'newpass123');
      expect(screen.getByText('Password Reset!')).toBeInTheDocument();
    });

    // Wait for the setTimeout in the component to trigger navigation (3 seconds)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 4000 });
  });

  it('5. should display error alert if api fails', async () => {
    const user = userEvent.setup();
    const errorMsg = 'Invalid token';
    api.auth.resetPassword.mockRejectedValueOnce({ message: errorMsg });
    
    const Swal = await import('sweetalert2');
    renderComponent();

    await user.type(screen.getByLabelText('New Password'), 'newpass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    
    await user.click(screen.getByRole('button', { name: /Reset Password/i }));

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

