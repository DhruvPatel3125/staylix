import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { loginSchema, validate } from '../../utils/validation';
import './Auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validate(loginSchema, formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
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
      const msg = err || err?.message || 'An error occurred';
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: msg
      });
    } finally {
      setLoading(false);
    }
  };


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

        <p className="auth-link">
          New to Staylix? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
