import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setCredentials } from '../features/auth/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, isAuthenticated, loading } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('organizationType');
        navigate('/');
        // ✅ No toast message
    };

    const handleLogin = (userData, token) => {
        dispatch(setCredentials({ user: userData, token }));
    };

    return {
        user,
        token,
        isAuthenticated,
        loading,
        handleLogout,
        handleLogin,
    };
};