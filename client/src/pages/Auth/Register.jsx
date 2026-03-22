import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import { User, Mail, Lock, Camera, X as CloseIcon, CheckCircle, ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OTPInput from '../../components/common/OTPInput/OTPInput';
import { registerSchema, validate } from '../../utils/validation';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitError, setSubmitError] = useState('');
  
  // OTP States
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const { register, verifyOTP, error: authError, clearErrors } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (submitError) setSubmitError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File too large', text: 'Please upload image < 5MB' });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(registerSchema, formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    clearErrors();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (image) data.append('profileImage', image);

    try {
      await register(data);
      setShowOTP(true);
      Swal.fire({
        icon: 'info',
        title: 'Verification Required',
        text: 'Please check your email for the 6-digit verification code.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.errors) setErrors(err.errors);
      const backendMsg = authError || err.message;
      if (backendMsg) {
        setSubmitError(backendMsg);
        Swal.fire({ icon: 'error', title: 'Registration Failed', text: backendMsg });
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
        title: 'Email Verified!',
        text: 'Welcome to Staylix. Your account is now active.',
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
            <p>We've sent a 6-digit code to <br /><strong>{formData.email}</strong></p>
          </div>

          <OTPInput 
            length={6} 
            onComplete={handleOTPComplete} 
            error={otpError} 
          />

          <div className="otp-footer">
            <p>Didn't receive the code?</p>
            <button className="resend-btn" onClick={() => setShowOTP(false)}>
              Try another email or Resend
            </button>
          </div>

          <p className="auth-link">
            <button className="back-to-reg" onClick={() => setShowOTP(false)}>
              Back to Registration
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="profile-upload-section">
            <label className="profile-upload-label">
              <div className="upload-avatar-container">
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Profile Preview" className="register-avatar-preview" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>
                      <CloseIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Camera size={32} />
                    <span>Photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <span className="upload-hint">Add profile picture (optional)</span>
            </label>
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            placeholder="John Doe"
          />

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

          <Button 
            type="submit" 
            loading={loading} 
            className="submit-btn" 
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Register
          </Button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

