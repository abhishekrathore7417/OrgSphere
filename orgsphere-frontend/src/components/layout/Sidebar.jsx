import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';

const Sidebar = ({ user, organizationType }) => {
    const location = useLocation();

    const navItems =
        organizationType === 'COMPANY' ? NAV_ITEMS.COMPANY : NAV_ITEMS.SCHOOL;

    return (
        <aside className="w-64 bg-white shadow-md flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-blue-600">OrgSphere</h2>
                <p className="text-sm text-gray-500">{organizationType}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            location.pathname === item.path
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t">
                <p className="text-xs text-gray-400">© 2026 OrgSphere</p>
            </div>
        </aside>
    );
};

export default Sidebar;