import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setCredentials } from './authSlice';
import { toast } from 'react-toastify';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, isAuthenticated, loading } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Logged out successfully');
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