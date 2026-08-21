import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Icon } from '@iconify/react';

const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const CLASSROOM_TABS = (id) => [
    { label: 'Students',   path: `/school/classrooms/${id}/students`   },
    { label: 'Attendance', path: `/school/classrooms/${id}/attendance` },
    { label: 'Fees',       path: `/school/classrooms/${id}/fees`       },
    { label: 'Leaves',     path: `/school/classrooms/${id}/leaves`     },
];

const SCHOOL_DEPT_TABS = (name) => [
    { label: 'Teachers',   path: `/school/departments/${name}/teachers`   },
    { label: 'Attendance', path: `/school/departments/${name}/attendance` },
    { label: 'Leaves',     path: `/school/departments/${name}/leaves`     },
    { label: 'Salary',     path: `/school/departments/${name}/salary`     },
];

const COMPANY_DEPT_TABS = (name) => [
    { label: 'Employees',  path: `/company/departments/${name}/employees`  },
    { label: 'Leaves',     path: `/company/departments/${name}/leaves`     },
    { label: 'Attendance', path: `/company/departments/${name}/attendance` },
    { label: 'Salary',     path: `/company/departments/${name}/salary`     },
];

const parseActiveRoute = (pathname) => {
    const crMatch       = pathname.match(/^\/school\/classrooms\/([^/]+)/);
    const schoolDept    = pathname.match(/^\/school\/departments\/([^/]+)/);
    const companyDept   = pathname.match(/^\/company\/departments\/([^/]+)/);
    return {
        activeClassroomId:  crMatch     ? decodeURIComponent(crMatch[1])     : null,
        activeSchoolDept:   schoolDept  ? decodeURIComponent(schoolDept[1])  : null,
        activeCompanyDept:  companyDept ? decodeURIComponent(companyDept[1]) : null,
    };
};

// ── Child item with expandable sub-tabs ───────────────────────
// groupKey: 'classrooms' | 'departments'
// basePath: '/school/...' | '/company/...'
const ChildGroup = ({ child, groupKey, basePath, isChildActive, navigate }) => {
    const [open, setOpen] = useState(false);

    // Auto-close when navigating away from this child (don't auto-open on refresh)
    useEffect(() => { 
        if (!isChildActive) setOpen(false);
    }, [isChildActive]);

    // Always compute subTabs from child.path so ANY child can be expanded
    let subTabs = [];
    if (groupKey === 'classrooms') {
        const m = child.path.match(/\/classrooms\/([^/]+)/);
        if (m) subTabs = CLASSROOM_TABS(m[1]);
    } else if (groupKey === 'departments' && basePath?.startsWith('/school')) {
        const m = child.path.match(/\/departments\/([^/]+)/);
        if (m) subTabs = SCHOOL_DEPT_TABS(decodeURIComponent(m[1]));
    } else if (groupKey === 'departments' && basePath?.startsWith('/company')) {
        const m = child.path.match(/\/departments\/([^/]+)/);
        if (m) subTabs = COMPANY_DEPT_TABS(decodeURIComponent(m[1]));
    }

    const hasSubs = subTabs.length > 0;

    return (
        <div>
            {/* Child row */}
            <div className={`flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                isChildActive ? 'text-[#553EEB]' : 'text-gray-700 hover:bg-gray-50'
            }`}>
                <button
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    onClick={() => {
                        navigate(child.path);
                        if (!open) setOpen(true);
                    }}
                >
                    <Icon icon="solar:record-circle-linear" width="14" height="14" className="shrink-0" />
                    <span className="truncate text-sm">{child.label}</span>
                </button>
                {hasSubs && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                        className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''} ${isChildActive ? 'text-[#553EEB]' : 'text-gray-400'}`}
                    >
                        <Icon icon="solar:alt-arrow-right-linear" width="13" height="13" />
                    </button>
                )}
            </div>

            {/* Sub-tabs */}
            {open && hasSubs && (
                <div className="ml-4 pl-2 border-l border-gray-100 space-y-0.5 my-0.5">
                    {subTabs.map(tab => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 ${
                                    isActive
                                        ? 'text-[#553EEB] font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-60" />
                            <span className="truncate">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};


// ── Expandable sidebar group ──────────────────────────────────
const TreeGroup = ({ item, sidebarOpen, fetchChildren, activeClassroomId, activeSchoolDept, activeCompanyDept, navigate }) => {
    const location = useLocation();
    const isInsideGroup = location.pathname.startsWith(item.basePath || item.path);

    const [open, setOpen] = useState(!!item.defaultOpen);
    const [children, setChildren] = useState([]);
    const [loaded, setLoaded]     = useState(false);
    const [loading, setLoading]   = useState(false);

    const load = () => {
        if (!fetchChildren) return;
        setLoading(true);
        fetchChildren(item.groupKey).then(items => {
            setChildren(items);
            setLoaded(true);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { if (open && !loaded) load(); }, [open]);

    // Auto-close when navigating away (but don't auto-open on refresh)
    useEffect(() => { 
        if (!isInsideGroup) setOpen(false);
    }, [isInsideGroup]);

    // Reload when navigating to list page (new items may have been added)
    useEffect(() => {
        if (location.pathname === item.path) load();
    }, [location.pathname]);

    return (
        <div>
            {/* Group header */}
            <div
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    open || isInsideGroup
                        ? 'bg-[#F0EFFF] text-[#553EEB]'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
                <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer truncate"
                    onClick={() => {
                        navigate(item.path);
                        if (!open) setOpen(true);
                    }}
                >
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${open || isInsideGroup ? 'text-[#553EEB]' : 'text-gray-600'}`}>
                        <Icon icon={item.icon || 'solar:folder-with-files-linear'} width="20" height="20" />
                    </span>
                    {sidebarOpen && <span className="truncate text-left">{item.label}</span>}
                </div>
                {sidebarOpen && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                        className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''} ${open || isInsideGroup ? 'text-[#553EEB]' : 'text-gray-400'}`}
                    >
                        <Icon icon="solar:alt-arrow-right-linear" width="16" height="16" />
                    </button>
                )}
            </div>

            {/* Children list */}
            {open && sidebarOpen && (
                <div className="ml-3 mt-0.5 pl-3 border-l border-gray-100 space-y-0.5">
                    {loading ? (
                        <div className="py-2 flex items-center gap-2 px-2">
                            <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-gray-400">Loading...</span>
                        </div>
                    ) : children.length === 0 ? (
                        <p className="text-xs text-gray-400 px-2 py-2 italic">No items yet</p>
                    ) : (
                        children.map(child => {
                            const isClassroomActive = item.groupKey === 'classrooms' &&
                                activeClassroomId && child.path === `/school/classrooms/${activeClassroomId}`;
                            const isSchoolDeptActive = item.groupKey === 'departments' && item.basePath?.startsWith('/school') &&
                                activeSchoolDept && child.path === `/school/departments/${activeSchoolDept}`;
                            const isCompanyDeptActive = item.groupKey === 'departments' && item.basePath?.startsWith('/company') &&
                                activeCompanyDept && child.path === `/company/departments/${activeCompanyDept}`;
                            const isChildActive = isClassroomActive || isSchoolDeptActive || isCompanyDeptActive;

                            return (
                                <ChildGroup
                                    key={child.path}
                                    child={child}
                                    groupKey={item.groupKey}
                                    basePath={item.basePath}
                                    isChildActive={isChildActive}
                                    navigate={navigate}
                                />
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Layout ───────────────────────────────────────────────
const DashboardLayout = ({ navItems, treeItems, fetchChildren, orgLabel, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { dispatch(logout()); navigate('/'); };

    const { activeClassroomId, activeSchoolDept, activeCompanyDept } = parseActiveRoute(location.pathname);

    const allFlat  = navItems || [];
    const current  = allFlat.find(i => location.pathname === i.path);
    const pageTitle = current?.label || 'Dashboard';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-[270px]' : 'w-[80px]'} shrink-0`}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">OS</span>
                    </div>
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm leading-none">OrgSphere</p>
                            <p className="text-xs text-violet-500 mt-0.5 truncate">{orgLabel}</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">

                    {/* FLAT MODE */}
                    {navItems && navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                                    isActive
                                        ? 'bg-[#F0EFFF] text-[#553EEB]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? 'text-[#553EEB]' : 'text-gray-600'}`}>
                                        <Icon icon={item.icon || 'solar:widget-linear'} width="20" height="20" />
                                    </span>
                                    {sidebarOpen && <span className="truncate">{item.label || item.name}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* TREE MODE */}
                    {treeItems && treeItems.map((item) => {
                        if (item.groupKey !== undefined) {
                            return (
                                <TreeGroup
                                    key={item.path}
                                    item={item}
                                    sidebarOpen={sidebarOpen}
                                    fetchChildren={fetchChildren}
                                    activeClassroomId={activeClassroomId}
                                    activeSchoolDept={activeSchoolDept}
                                    activeCompanyDept={activeCompanyDept}
                                    navigate={navigate}
                                />
                            );
                        }
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                                        isActive
                                            ? 'bg-[#F0EFFF] text-[#553EEB]'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? 'text-[#553EEB]' : 'text-gray-600'}`}>
                                            <Icon icon={item.icon || 'solar:widget-linear'} width="20" height="20" />
                                        </span>
                                        {sidebarOpen && <span className="truncate">{item.label || item.name}</span>}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="px-2 py-3 border-t border-gray-100">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                            </div>
                            <button onClick={handleLogout} title="Logout" className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLogout} className="w-full flex justify-center py-2 text-gray-300 hover:text-red-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold text-gray-800">{pageTitle}</h1>
                        <p className="text-xs text-gray-400 truncate">{user?.organizationName || orgLabel}</p>
                    </div>
                    <div className="hidden sm:block text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="relative">
                        <button onClick={() => setProfileOpen(!profileOpen)} className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-48 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Sign out</button>
                            </div>
                        )}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="h-full">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
