import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password has been reset successfully.',
        timer: 3000,
        showConfirmButton: false
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: err.message || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="otp-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle size={40} />
          </div>
          <h1>Password Reset!</h1>
          <p>Your password has been changed successfully. You can now login with your new credentials.</p>
          <Link to="/login" className="submit-btn" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '2rem' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Set New Password</h1>
        <p className="auth-subtitle">Please enter your new password below.</p>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            placeholder="••••••••"
            required
            minLength={6}
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            placeholder="••••••••"
            required
            minLength={6}
          />

          <Button 
            type="submit" 
            loading={loading} 
            className="submit-btn" 
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
