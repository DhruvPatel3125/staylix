import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
<<<<<<< HEAD
import LuxuryHero from '../../components/features/LuxuryHero/LuxuryHero';
=======
import HeroSection from './components/HeroSection/HeroSection';
>>>>>>> 917d9b2b35052868119d719d8d8c5f4cd66d9f0c

export default function HeroPage() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }

  if (isAuthenticated && user?.role === 'owner') {
    return <Navigate to="/owner-dashboard" />;
  }

<<<<<<< HEAD
  return <LuxuryHero />;
}

=======
  return <HeroSection />;
}
>>>>>>> 917d9b2b35052868119d719d8d8c5f4cd66d9f0c
