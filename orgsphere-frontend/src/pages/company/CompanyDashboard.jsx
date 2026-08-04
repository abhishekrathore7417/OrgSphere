import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CompanyLayout from '../../components/layout/CompanyLayout';

export const COMPANY_NAV = [
    { path: '/company/dashboard',   label: 'Dashboard',   icon: <HomeIcon /> },
    { path: '/company/departments', label: 'Departments', icon: <BuildingIcon /> },
];

/* ── SVG Icons (inline, no emoji) ─────────────────────────── */
function HomeIcon()     { return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }
function UsersIcon()    { return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function BuildingIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>; }
function LeaveIcon()    { return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>; }
function ClockIcon()    { return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ label, value, badge, icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                {icon}
            </div>
            {badge && (
                <span className="text-xs bg-violet-50 text-violet-600 font-medium px-2 py-0.5 rounded-full border border-violet-100">
                    {badge}
                </span>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-800">—</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
);

/* ── Quick Action Card ─────────────────────────────────────── */
const ActionCard = ({ icon, title, desc, onClick, badge }) => (
    <button
        onClick={onClick}
        className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-violet-300 hover:shadow-sm transition-all duration-150 w-full group"
    >
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-violet-50 flex items-center justify-center text-gray-500 group-hover:text-violet-600 transition-colors shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    {badge && (
                        <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full border border-amber-100">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 group-hover:text-violet-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </div>
    </button>
);

/* ── Activity Row ──────────────────────────────────────────── */
const ActivityRow = ({ dot, text, time }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <p className="flex-1 text-sm text-gray-600">{text}</p>
        <span className="text-xs text-gray-400 shrink-0">{time}</span>
    </div>
);

/* ── Main ──────────────────────────────────────────────────── */
const CompanyDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate  = useNavigate();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const stats = [
        { label: 'Total Employees',    badge: 'Active',   icon: <UsersIcon /> },
        { label: 'Departments',        badge: 'Teams',    icon: <BuildingIcon /> },
        { label: 'Pending Leaves',     badge: 'Requests', icon: <LeaveIcon /> },
        { label: "Today's Attendance", badge: 'Present',  icon: <ClockIcon /> },
    ];

    const actions = [
        { icon: <BuildingIcon />, title: 'Manage Departments', desc: 'Create departments and manage teams',       path: '/company/departments' },
        { icon: <UsersIcon />,    title: 'Add Employee',       desc: 'Onboard a new employee to a department',   path: '/company/departments' },
        { icon: <LeaveIcon />,    title: 'Leave Requests',     desc: 'Review and approve pending applications',  path: '/company/departments', badge: 'Pending' },
        { icon: <ClockIcon />,    title: 'Mark Attendance',    desc: "Record today's employee attendance",       path: '/company/departments' },
    ];

    const activity = [
        { dot: 'bg-green-400',  text: 'Attendance marked for today',  time: 'Just now' },
        { dot: 'bg-amber-400',  text: 'New leave request submitted',   time: '2h ago'   },
        { dot: 'bg-violet-400', text: 'New employee profile created',  time: '1d ago'   },
        { dot: 'bg-blue-400',   text: 'Department updated',            time: '2d ago'   },
        { dot: 'bg-green-400',  text: 'Leave request approved',        time: '3d ago'   },
    ];

    return (
        <CompanyLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ── Welcome Banner ── */}
                <div className="bg-violet-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-violet-200 text-sm">{greeting},</p>
                            <h2 className="text-xl font-bold mt-0.5">{user?.fullName || 'Admin'}</h2>
                            <p className="text-violet-300 text-sm mt-1">
                                {user?.organizationName || 'Your Company'}&nbsp;&nbsp;·&nbsp;&nbsp;{user?.role}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/company/departments')}
                                className="bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/20 transition-colors"
                            >
                                + Add Employee
                            </button>
                            <button
                                onClick={() => navigate('/company/departments')}
                                className="bg-white text-violet-700 hover:bg-violet-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Attendance
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                {/* ── Quick Actions + Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">Quick Actions</p>
                            <p className="text-xs text-gray-400">Manage your company</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {actions.map((a, i) => (
                                <ActionCard key={i} {...a} onClick={() => navigate(a.path)} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-gray-800">Recent Activity</p>
                            <span className="text-xs text-violet-600 font-medium cursor-pointer hover:underline">View all</span>
                        </div>
                        {activity.map((a, i) => <ActivityRow key={i} {...a} />)}
                    </div>
                </div>

                {/* ── Module Cards ── */}
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-3">Modules</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Departments', sub: 'Team structure & employees', path: '/company/departments', icon: <BuildingIcon /> },
                        ].map((card, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(card.path)}
                                className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-violet-300 hover:shadow-sm transition-all duration-150 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center text-violet-600 mb-3 transition-colors">
                                    {card.icon}
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{card.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </CompanyLayout>
    );
};

export default CompanyDashboard;
