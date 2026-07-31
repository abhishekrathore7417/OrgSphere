import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import RegistrationPopup from '../auth/RegistrationPopup';
import LoginPopup from '../auth/LoginPopup';

const Navbar = () => {
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const { user, isAuthenticated, organizationType } = useSelector((state) => state.auth);
    const { handleLogout } = useAuth();

    const onLogout = () => {
        handleLogout();
        setShowLoginPopup(false);
        setShowRegisterPopup(false);
    };

    return (
        <>
            <nav className="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-2.5 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OrgSphere</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">| Manage Smarter</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  👋 {user?.fullName?.split(' ')[0]}
                </span>
                                <Link
                                    to={organizationType === 'COMPANY' ? '/company/dashboard' : '/school/dashboard'}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowRegisterPopup(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all"
                                >
                                    Register
                                </button>
                                <button
                                    onClick={() => setShowLoginPopup(true)}
                                    className="border-2 border-blue-600 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-all"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <RegistrationPopup isOpen={showRegisterPopup} onClose={() => setShowRegisterPopup(false)} />
            <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        </>
    );
};

export default Navbar;