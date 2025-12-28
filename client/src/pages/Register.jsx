import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/authContext';
import { User, Mail, Lock, Building2 } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register(name, email, password, role);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Account created successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        const msg = response.message || 'Registration failed';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
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
        <h1>Create Account</h1>
        
        {error && <div className="error-message">⚠️ {error}</div>}

        {/* <div className="role-tabs">
          <div 
            className={`role-tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
          >
            <User size={18} /> Traveler
          </div>

        </div> */}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=""
              />
            </div>
          </div>

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
            <label htmlFor="password">Create Password</label>
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
