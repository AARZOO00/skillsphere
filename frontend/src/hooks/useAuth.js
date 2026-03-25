import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, token, loading } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return {
    user, token, loading,
    isAuthenticated: !!token && !!user,
    isClient:     user?.role === 'client',
    isFreelancer: user?.role === 'freelancer',
    isAdmin:      user?.role === 'admin',
    logout: () => { dispatch(logout()); navigate('/login'); }
  };
};
