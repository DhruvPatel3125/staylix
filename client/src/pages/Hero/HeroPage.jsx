import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import HeroSection from './components/HeroSection/HeroSection';

export default function HeroPage() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }

  if (isAuthenticated && user?.role === 'owner') {
    return <Navigate to="/owner-dashboard" />;
  }

  return <HeroSection />;
}
