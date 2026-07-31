import { useAuth } from '../../hooks/useAuth.jsx';

const Header = ({ user }) => {
    const { handleLogout } = useAuth();

    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
                Welcome back, {user?.fullName}
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{user?.email}</span>
                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-medium"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;