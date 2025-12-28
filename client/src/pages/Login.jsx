import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/authContext';
import { Mail, Lock } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: 'Welcome back to Staylix!',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        const msg = response.message || 'Login failed';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: msg
        });
      }
    } catch (err) {
      const msg = err.message || 'An error occurred';
      setError(msg);
      Swal.fire({
        icon: 'error',
        title: 'Error',
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
        
        {error && <div className="error-message">⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=""
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=""
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          New to Staylix? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
