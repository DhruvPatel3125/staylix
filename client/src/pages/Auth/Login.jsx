import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OTPInput from '../../components/common/OTPInput/OTPInput';
import { loginSchema, validate } from '../../utils/validation';
import './Auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // OTP States
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const { login, googleAuth, verifyOTP, error: authError, isUnverified, clearErrors } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(loginSchema, formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setSubmitError('');
    clearErrors();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: 'Welcome back to Staylix!',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle unverified user
      if (err.isUnverified) {
        setShowOTP(true);
        Swal.fire({
          icon: 'warning',
          title: 'Email Not Verified',
          text: 'Please verify your email address to continue.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        return;
      }

      if (err.errors) setErrors(err.errors);
      const backendMsg = authError || err.message;
      if (backendMsg) {
        setSubmitError(backendMsg);
        Swal.fire({ icon: 'error', title: 'Login Failed', text: backendMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setVerifying(true);
    setOtpError('');
    try {
      await verifyOTP(formData.email, otp);
      Swal.fire({
        icon: 'success',
        title: 'Verified!',
        text: 'Your email has been verified. Welcome!',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/');
    } catch (err) {
      setOtpError(err.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setSubmitError('');
    try {
      await googleAuth(credentialResponse.credential);
      Swal.fire({
        icon: 'success',
        title: 'Logged in successfully',
        text: 'Welcome to Staylix!',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/');
    } catch (err) {
      console.error('Google Auth Error:', err);
      const backendMsg = err.message || 'Google Login failed';
      setSubmitError(backendMsg);
      Swal.fire({ icon: 'error', title: 'Login Failed', text: backendMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authError && !showOTP) {
      setSubmitError(authError);
    }
  }, [authError, showOTP]);

  if (showOTP) {
    return (
      <div className="auth-container">
        <div className="auth-card otp-card">
          <div className="otp-header">
            <div className="otp-icon-wrapper">
              <ShieldCheck size={40} className="otp-icon" />
            </div>
            <h1>Verify Your Email</h1>
            <p>Enter the 6-digit code sent to <br /><strong>{formData.email}</strong></p>
          </div>

          <OTPInput 
            length={6} 
            onComplete={handleOTPComplete} 
            error={otpError} 
          />

          <p className="auth-link">
            <button className="back-to-reg" onClick={() => setShowOTP(false)}>
              <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            placeholder="john@example.com"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            placeholder="••••••••"
          />

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            className="submit-btn" 
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Sign In
          </Button>
        </form>

        <div className="divider-premium">
          <span>OR</span>
        </div>

        <div className="google-btn-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setSubmitError("Google login failed. Please try again.");
              Swal.fire({ icon: 'error', title: 'Login Failed', text: "Google login failed. Please try again." });
            }}
            useOneTap
            theme="filled_blue"
            shape="pill"
            width="350"
          />
        </div>

        <p className="auth-link">
          New to Staylix? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

