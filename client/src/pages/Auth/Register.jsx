import { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import { User, Mail, Lock, Camera, X as CloseIcon } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
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
  const navigate = useNavigate();
  const { register, error: authError, clearErrors } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File too large',
          text: 'Please upload an image smaller than 5MB'
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
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

    // Clear previous errors
    setErrors({});
    setSubmitError('');
    clearErrors();

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (image) {
      data.append('profileImage', image);
    }

    try {
      await register(data);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Account created successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Backend field errors (Joi)
      if (err.errors) {
        setErrors(err.errors);
      } 
      
      // Backend message (already in authError via Redux)
      const backendMsg = authError || err.message;
      if (backendMsg) {
        setSubmitError(backendMsg);
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: backendMsg  // ✅ "Email already exists"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authError) {
      setSubmitError(authError);
    }
  }, [authError]);


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
