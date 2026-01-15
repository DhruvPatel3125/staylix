import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.auth.forgotPassword(email);
            toast.success('Email sent successfully! Please check your inbox.');
            setEmail('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
             <ToastContainer />
            <div className="auth-card">
                <h1>Forgot Password</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a5568' }}>
                    Enter your email to receive a password reset link
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-link">
                    Remember your password?
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
