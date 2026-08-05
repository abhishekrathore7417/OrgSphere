import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import CompanyLayout from '../../components/layout/CompanyLayout';
import { companyApi } from '../../api/companyApi';

/* ── Icons ──────────────────────────────────────────────────── */
const Icons = {
    users:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    building: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    leave:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    clock:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    refresh:  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    arrow:    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    trend:    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
};

/* ── Helpers ────────────────────────────────────────────────── */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 2)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
}

/* ── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, gradient, iconBg, badge, badgeColor, onClick, loading }) => (
    <button onClick={onClick}
        className={`${gradient} rounded-2xl p-5 text-left w-full group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border`}>
        <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                {icon}
            </div>
            {badge && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
            )}
        </div>
        {loading
            ? <div className="h-9 w-16 bg-white/40 rounded-lg animate-pulse mb-1" />
            : <p className="text-3xl font-black tracking-tight text-gray-800">{value ?? '—'}</p>
        }
        <p className="text-sm font-semibold text-gray-600 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        <div className="flex items-center gap-1 mt-3 text-violet-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            View details {Icons.arrow}
        </div>
    </button>
);

/* ── Activity Row ───────────────────────────────────────────── */
const ActivityRow = ({ dot, text, time }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dot}`} />
        <p className="flex-1 text-sm text-gray-600 leading-snug">{text}</p>
        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{time}</span>
    </div>
);

/* ── Custom Tooltip ─────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-gray-700 mb-1.5 text-xs uppercase tracking-wide">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-xs text-gray-500">{p.name}:</span>
                    <span className="text-xs font-bold text-gray-800">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Main Component ─────────────────────────────────────────── */
const CompanyDashboard = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const navigate = useNavigate();

    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const today    = new Date().toISOString().split('T')[0];

    const [loading,     setLoading]     = useState(true);
    const [employees,   setEmployees]   = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allLeaves,   setAllLeaves]   = useState([]);
    const [todayAtt,    setTodayAtt]    = useState([]);
    const [allAtt,      setAllAtt]      = useState([]);
    const [activity,    setActivity]    = useState([]);

    const totalEmployees = employees.length;
    const totalDepts     = departments.length;
    const pendingLeaves  = allLeaves.filter(l => l.status === 'PENDING').length;
    const todayPresent   = todayAtt.filter(a => a.status === 'PRESENT').length;
    const todayAbsent    = todayAtt.filter(a => a.status === 'ABSENT').length;

    const fetchAll = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [empR, deptR, leaveR, todayR, allAttR] = await Promise.allSettled([
                companyApi.getEmployeesByOrganization(orgId),
                companyApi.getDepartmentsByOrganization(orgId),
                companyApi.getLeavesByOrganization(orgId),
                companyApi.getAttendanceByDate(orgId, today),
                companyApi.getAttendanceByOrganization(orgId),
            ]);
            const emps   = empR.status    === 'fulfilled' ? (empR.value.data.data    || []) : [];
            const depts  = deptR.status   === 'fulfilled' ? (deptR.value.data.data   || []) : [];
            const leaves = leaveR.status  === 'fulfilled' ? (leaveR.value.data.data  || []) : [];
            const tAtt   = todayR.status  === 'fulfilled' ? (todayR.value.data.data  || []) : [];
            const aAtt   = allAttR.status === 'fulfilled' ? (allAttR.value.data.data || []) : [];

            setEmployees(emps);
            setDepartments(depts);
            setAllLeaves(leaves);
            setTodayAtt(tAtt);
            setAllAtt(aAtt);

            // Build activity feed
            const events = [];
            [...tAtt].sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt))
                .slice(0, 2).forEach(a => events.push({
                    dot:  a.status==='PRESENT' ? 'bg-green-400' : a.status==='ABSENT' ? 'bg-red-400' : 'bg-amber-400',
                    text: `${a.userFullName||'Employee'} marked ${a.status?.toLowerCase()} today`,
                    time: timeAgo(a.updatedAt||a.createdAt),
                    ts:   new Date(a.updatedAt||a.createdAt).getTime(),
                }));
            leaves.filter(l=>l.status==='PENDING')
                .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
                .slice(0, 2).forEach(l => events.push({
                    dot:  'bg-amber-400',
                    text: `${l.userFullName||'Employee'} applied for ${l.leaveType?.toLowerCase()||''} leave`,
                    time: timeAgo(l.createdAt),
                    ts:   new Date(l.createdAt).getTime(),
                }));
            [...emps].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
                .slice(0, 2).forEach(e => events.push({
                    dot:  'bg-violet-400',
                    text: `${e.userFullName||'Employee'} joined ${e.department||'a dept'} as ${e.designation||'employee'}`,
                    time: timeAgo(e.createdAt),
                    ts:   new Date(e.createdAt).getTime(),
                }));
            [...depts].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
                .slice(0, 1).forEach(d => events.push({
                    dot:  'bg-indigo-400',
                    text: `Department "${d.name||d.departmentName}" was created`,
                    time: timeAgo(d.createdAt),
                    ts:   new Date(d.createdAt).getTime(),
                }));
            events.sort((a,b) => b.ts - a.ts);
            setActivity(events.slice(0, 6));
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [orgId, today]);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    /* ── Chart data ── */
    const last7 = getLast7Days();
    const attChartData = last7.map(date => {
        const dayAtt = allAtt.filter(a => a.attendanceDate === date);
        return {
            day:     date.slice(5),
            Present: dayAtt.filter(a => a.status === 'PRESENT').length,
            Absent:  dayAtt.filter(a => a.status === 'ABSENT').length,
        };
    });

    const leavePie = [
        { name: 'Pending',  value: allLeaves.filter(l=>l.status==='PENDING').length,  color: '#f59e0b' },
        { name: 'Approved', value: allLeaves.filter(l=>l.status==='APPROVED').length, color: '#10b981' },
        { name: 'Rejected', value: allLeaves.filter(l=>l.status==='REJECTED').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const attPie = [
        { name: 'Present',  value: todayAtt.filter(a=>a.status==='PRESENT').length,  color: '#10b981' },
        { name: 'Absent',   value: todayAtt.filter(a=>a.status==='ABSENT').length,   color: '#ef4444' },
        { name: 'On Leave', value: todayAtt.filter(a=>a.status==='ON_LEAVE').length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const firstDept = departments[0]?.name || departments[0]?.departmentName;
    const deptPath  = firstDept ? `/company/departments/${encodeURIComponent(firstDept)}/employees` : '/company/departments';

    return (
        <CompanyLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
                    <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute top-4 right-4 opacity-10">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="relative flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-violet-200 text-sm font-medium">{greeting} 👋</p>
                            <h2 className="text-2xl font-black mt-0.5 tracking-tight">{user?.fullName || 'Admin'}</h2>
                            <p className="text-violet-300 text-sm mt-1">{user?.organizationName || 'Your Company'} &nbsp;·&nbsp; {user?.role}</p>
                            <div className="flex gap-5 mt-4">
                                {[
                                    { label: 'Employees', value: loading ? '…' : totalEmployees },
                                    { label: 'Departments', value: loading ? '…' : totalDepts },
                                    { label: 'Present Today', value: loading ? '…' : todayPresent },
                                    { label: 'Pending Leaves', value: loading ? '…' : pendingLeaves },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xl font-black">{s.value}</p>
                                        <p className="text-xs text-violet-300 mt-0.5 whitespace-nowrap">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-start">
                            <button onClick={() => navigate(deptPath)}
                                className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2 rounded-xl border border-white/20 transition-colors backdrop-blur-sm">
                                + Add Employee
                            </button>
                            <button onClick={fetchAll} title="Refresh dashboard"
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/20 transition-colors">
                                {Icons.refresh}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        loading={loading} label="Total Employees" value={totalEmployees}
                        sub="Across all departments"
                        badge="Active" badgeColor="bg-violet-100 text-violet-700"
                        icon={<span className="text-violet-600">{Icons.users}</span>}
                        gradient="bg-white border-violet-100" iconBg="bg-violet-50"
                        onClick={() => navigate('/company/all-employees')}
                    />
                    <StatCard
                        loading={loading} label="Departments" value={totalDepts}
                        sub="Teams configured"
                        badge="Teams" badgeColor="bg-indigo-100 text-indigo-700"
                        icon={<span className="text-indigo-600">{Icons.building}</span>}
                        gradient="bg-white border-indigo-100" iconBg="bg-indigo-50"
                        onClick={() => navigate('/company/departments')}
                    />
                    <StatCard
                        loading={loading} label="Pending Leaves" value={pendingLeaves}
                        sub="Awaiting approval"
                        badge="Requests" badgeColor="bg-amber-100 text-amber-700"
                        icon={<span className="text-amber-600">{Icons.leave}</span>}
                        gradient="bg-white border-amber-100" iconBg="bg-amber-50"
                        onClick={() => navigate('/company/all-leaves')}
                    />
                    <StatCard
                        loading={loading} label="Present Today" value={todayPresent}
                        sub={todayAbsent > 0 ? `${todayAbsent} absent` : 'No absences today'}
                        badge="Today" badgeColor="bg-green-100 text-green-700"
                        icon={<span className="text-green-600">{Icons.clock}</span>}
                        gradient="bg-white border-green-100" iconBg="bg-green-50"
                        onClick={() => navigate('/company/all-attendance')}
                    />
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Attendance Trend — takes 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Attendance Trend</p>
                                <p className="text-xs text-gray-400 mt-0.5">Last 7 days — Present vs Absent</p>
                            </div>
                            <button onClick={() => navigate('/company/all-attendance')}
                                className="flex items-center gap-1 text-xs text-violet-600 font-bold hover:underline">
                                View all {Icons.arrow}
                            </button>
                        </div>
                        {loading ? (
                            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                        ) : allAtt.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                <p className="text-sm font-medium">No attendance data yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={176}>
                                <AreaChart data={attChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="gpresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gabsent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="Present" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gpresent)" dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
                                    <Area type="monotone" dataKey="Absent"  stroke="#ef4444" strokeWidth={2} fill="url(#gabsent)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                        <div className="flex gap-5 mt-3">
                            <div className="flex items-center gap-2"><span className="w-3 h-0.5 rounded bg-violet-600 inline-block" /><span className="text-xs text-gray-500 font-medium">Present</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-0.5 rounded bg-red-400 inline-block" /><span className="text-xs text-gray-500 font-medium">Absent</span></div>
                        </div>
                    </div>

                    {/* Today attendance pie */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Today's Status</p>
                                <p className="text-xs text-gray-400 mt-0.5">{today}</p>
                            </div>
                            <button onClick={() => navigate('/company/all-attendance')}
                                className="flex items-center gap-1 text-xs text-violet-600 font-bold hover:underline">
                                View {Icons.arrow}
                            </button>
                        </div>
                        {loading ? (
                            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                        ) : attPie.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-300">
                                <p className="text-sm font-medium">No attendance marked</p>
                                <button onClick={() => navigate(deptPath)}
                                    className="text-xs text-violet-500 font-bold hover:underline">Mark now →</button>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={176}>
                                <PieChart>
                                    <Pie data={attPie} cx="50%" cy="45%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {attPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v, n]} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Leave Pie + Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Leave status pie */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Leave Breakdown</p>
                                <p className="text-xs text-gray-400 mt-0.5">All requests</p>
                            </div>
                            <button onClick={() => navigate('/company/all-leaves')}
                                className="flex items-center gap-1 text-xs text-violet-600 font-bold hover:underline">
                                View {Icons.arrow}
                            </button>
                        </div>
                        {loading ? (
                            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                        ) : leavePie.length === 0 ? (
                            <div className="h-44 flex items-center justify-center text-gray-300 text-sm font-medium">No leave data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={176}>
                                <PieChart>
                                    <Pie data={leavePie} cx="50%" cy="45%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {leavePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v, n]} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Recent Activity — takes 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Recent Activity</p>
                                <p className="text-xs text-gray-400 mt-0.5">Latest actions across your company</p>
                            </div>
                            <button onClick={fetchAll}
                                className="flex items-center gap-1.5 text-xs text-violet-600 font-bold hover:underline">
                                {Icons.refresh} Refresh
                            </button>
                        </div>
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-100 animate-pulse shrink-0" />
                                        <div className="flex-1 h-3 bg-gray-100 rounded animate-pulse" />
                                        <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : activity.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center gap-1 text-gray-300">
                                <p className="text-sm font-medium">No recent activity</p>
                                <p className="text-xs">Actions will appear here as data is added</p>
                            </div>
                        ) : (
                            activity.map((a, i) => <ActivityRow key={i} {...a} />)
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div>
                    <p className="text-sm font-bold text-gray-800 mb-3">Quick Actions</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Employees',      sub: `${totalEmployees} active`, icon: Icons.users,    path: '/company/all-employees',  iconBg: 'bg-violet-100 text-violet-600' },
                            { label: 'Departments',    sub: `${totalDepts} teams`,      icon: Icons.building, path: '/company/departments',    iconBg: 'bg-indigo-100 text-indigo-600' },
                            { label: 'Leave Requests', sub: `${pendingLeaves} pending`, icon: Icons.leave,    path: '/company/all-leaves',     iconBg: 'bg-amber-100 text-amber-600'   },
                            { label: 'Attendance',     sub: `${todayPresent} present`,  icon: Icons.clock,    path: '/company/all-attendance', iconBg: 'bg-green-100 text-green-600'   },
                        ].map((card, i) => (
                            <button key={i} onClick={() => navigate(card.path)}
                                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-violet-200 hover:shadow-md transition-all duration-150 group shadow-sm">
                                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-150`}>
                                    {card.icon}
                                </div>
                                <p className="text-sm font-bold text-gray-800">{card.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                                <div className="flex items-center gap-1 mt-3 text-violet-500 text-xs font-bold">
                                    Open {Icons.arrow}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </CompanyLayout>
    );
};

export default CompanyDashboard;
