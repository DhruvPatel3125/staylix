import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lock } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
             toast.error("Password must be at least 6 characters");
             return;
        }

        setLoading(true);

        try {
            await api.auth.resetPassword(resetToken, password);
            toast.success('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error(error);
             toast.error(error.response?.data?.message || 'Failed to reset password. Link might be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <ToastContainer />
            <div className="auth-card">
                <h1>Reset Password</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a5568' }}>
                    Enter your new password below
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
