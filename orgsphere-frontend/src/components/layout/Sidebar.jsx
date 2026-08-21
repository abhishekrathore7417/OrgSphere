import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const Sidebar = ({ user, organizationType }) => {
    const location = useLocation();
    
    // We get the nav items based on the org type
    const navItems = organizationType === 'COMPANY' ? NAV_ITEMS.COMPANY : NAV_ITEMS.SCHOOL;

    return (
        <aside className="w-[270px] bg-white h-screen fixed left-0 top-0 z-10 overflow-hidden flex flex-col border-r border-gray-100">
            {/* Logo Section */}
            <div className="flex flex-col justify-center shrink-0 border-b border-gray-100 p-6 h-[100px]">
                <h2 className="text-2xl font-black text-violet-800 tracking-tight flex items-center gap-2">
                    <Icon icon="solar:planet-3-bold-duotone" width="32" height="32" className="text-violet-600" />
                    OrgSphere
                </h2>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1 ml-10">
                    {organizationType} PORTAL
                </p>
            </div>

            {/* Scrollable Navigation Area */}
            <SimpleBar style={{ height: "calc(100vh - 100px)" }} className="w-full" autoHide={false}>
                <div className="p-4 space-y-1.5">
                    {navItems.map((item) => {
                        const isSelected = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    isSelected
                                        ? 'bg-violet-100/60 text-violet-700'
                                        : 'text-gray-600 hover:bg-violet-50/50 hover:text-violet-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon 
                                        icon={item.icon || 'solar:widget-linear'} 
                                        width="22" 
                                        height="22" 
                                        className={isSelected ? 'text-violet-600' : 'text-gray-500 group-hover:text-violet-500 transition-colors'} 
                                    />
                                    <span className="text-[15px]">{item.name}</span>
                                </div>
                                {!isSelected && (
                                    <Icon 
                                        icon="solar:alt-arrow-right-linear" 
                                        width="16" 
                                        height="16" 
                                        className="text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
                
                {/* Copyright info inside scrollable area at bottom (optional but good for spacing) */}
                <div className="mt-10 px-6 pb-6">
                    <p className="text-[11px] font-semibold text-gray-300">© 2026 OrgSphere</p>
                </div>
            </SimpleBar>
        </aside>
    );
};

export default Sidebar;