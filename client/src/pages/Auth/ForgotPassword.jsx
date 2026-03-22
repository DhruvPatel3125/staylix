import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OTPInput from '../../components/common/OTPInput/OTPInput';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setStep(2);
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: 'Please check your email for the reset code.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to send OTP'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setVerifying(true);
    setOtpError('');
    try {
      const response = await api.auth.verifyResetOTP(email, otp);
      setResetToken(response.resetToken);
      setStep(3); // 3: Success redirect or New Password step
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setVerifying(false);
    }
  };

  if (step === 3) {
      // Redirect to ResetPassword page with the token
      // We could also just render ResetPassword inline here
      return (
          <div className="auth-container">
              <div className="auth-card otp-card">
                  <div className="otp-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                      <ShieldCheck size={40} />
                  </div>
                  <h1>Identity Verified</h1>
                  <p>Your identity has been confirmed. <br /> You can now set your new password.</p>
                  <Link to={`/reset-password/${resetToken}`} className="submit-btn" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '2rem' }}>
                      Set New Password
                  </Link>
              </div>
          </div>
      );
  }

  if (step === 2) {
    return (
      <div className="auth-container">
        <div className="auth-card otp-card">
          <div className="otp-header">
            <div className="otp-icon-wrapper">
              <ShieldCheck size={40} className="otp-icon" />
            </div>
            <h1>Verification</h1>
            <p>Enter the 6-digit code sent to <br /><strong>{email}</strong></p>
          </div>

          <OTPInput 
            length={6} 
            onComplete={handleOTPComplete} 
            error={otpError} 
          />

          <div className="otp-footer">
            <p>Didn't receive the code?</p>
            <button className="resend-btn" onClick={() => setStep(1)}>
              Resend or change email
            </button>
          </div>

          <p className="auth-link">
            <button className="back-to-reg" onClick={() => setStep(1)}>
               <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
               Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a code to reset your password.</p>
        
        <form onSubmit={handleSendOTP}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            placeholder="john@example.com"
            required
          />

          <Button 
            type="submit" 
            loading={loading} 
            className="submit-btn" 
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Send Reset Code
          </Button>
        </form>

        <p className="auth-link">
          Remember your password? <Link to="/login">Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}
