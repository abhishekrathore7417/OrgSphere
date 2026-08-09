import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import SchoolLayout from '../../components/layout/SchoolLayout';
import { schoolApi } from '../../api/schoolApi';
import { companyApi } from '../../api/companyApi';
import { subscriptionApi } from '../../api/subscriptionApi';

/* ── Icons ──────────────────────────────────────────────────── */
const Icons = {
    students:  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    teachers:  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    classroom: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    fees:      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    refresh:   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    arrow:     <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    announce:  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
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
            : <p className="text-2xl font-bold tracking-tight text-gray-800">{value ?? '—'}</p>
        }
        <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </button>
);

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
const SchoolDashboard = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const navigate = useNavigate();

    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const today    = new Date().toISOString().split('T')[0];

    const [loading,     setLoading]     = useState(true);
    const [subDays,     setSubDays]     = useState(null);
    const [students,    setStudents]    = useState([]);
    const [teachers,    setTeachers]    = useState([]);
    const [fees,        setFees]        = useState([]);
    const [todayAtt,    setTodayAtt]    = useState([]);
    const [allAtt,      setAllAtt]      = useState([]);
    const [activity,    setActivity]    = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [academicYear, setAcademicYear] = useState(null);
    const [classrooms,  setClassrooms]  = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchAll = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [stuR, tchR, feeR, todayR, allAttR, annR, yearR, classR, deptR, subR] = await Promise.allSettled([
                schoolApi.getStudentsByOrganization(orgId),
                schoolApi.getTeachersByOrganization(orgId),
                schoolApi.getFeesByOrganization(orgId),
                companyApi.getAttendanceByDate(orgId, today),
                companyApi.getAttendanceByOrganization(orgId),
                schoolApi.getAnnouncementsByOrganization(orgId),
                schoolApi.getCurrentAcademicYear(orgId),
                schoolApi.getClassroomsByOrganization(orgId),
                companyApi.getDepartmentsByOrganization(orgId),
                subscriptionApi.getByOrganization(orgId),
            ]);

            const stus   = stuR.status    === 'fulfilled' ? (stuR.value.data.data    || []) : [];
            const tchs   = tchR.status    === 'fulfilled' ? (tchR.value.data.data    || []) : [];
            const fs     = feeR.status    === 'fulfilled' ? (feeR.value.data.data    || []) : [];
            const tAtt   = todayR.status  === 'fulfilled' ? (todayR.value.data.data  || []) : [];
            const aAtt   = allAttR.status === 'fulfilled' ? (allAttR.value.data.data || []) : [];
            const anns   = annR.status    === 'fulfilled' ? (annR.value.data.data    || []) : [];
            const ay     = yearR.status   === 'fulfilled' ? (yearR.value.data.data) : null;
            const cls    = classR.status  === 'fulfilled' ? (classR.value.data.data  || []) : [];
            const dpts   = deptR.status   === 'fulfilled' ? (deptR.value.data.data   || []) : [];
            const subData = subR.status   === 'fulfilled' ? (subR.value.data.data) : null;

            setStudents(stus.filter(s => s.status === 'ACTIVE'));   // only ACTIVE students
            setTeachers(tchs);
            // Only fees of ACTIVE students
            const activeStudentUserIds = new Set(stus.filter(s => s.status === 'ACTIVE').map(s => s.userId));
            setFees(fs.filter(f => activeStudentUserIds.has(f.studentId)));
            setTodayAtt(tAtt);
            setAllAtt(aAtt);
            setAnnouncements(anns.slice(0, 4));
            setAcademicYear(ay);
            setClassrooms(cls.filter(c => c.status === 'ACTIVE')); // only ACTIVE classrooms
            setDepartments(dpts);
            // Calculate days remaining from subscription expiry
            if (subData?.endDate) {
                const days = Math.max(0, Math.ceil((new Date(subData.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
                setSubDays(days);
            }

            // Build activity
            const events = [];
            [...stus].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,2).forEach(s => events.push({
                dot:  'bg-violet-400', text: `${s.userFullName||'Student'} enrolled`, time: timeAgo(s.createdAt), ts: new Date(s.createdAt).getTime(),
            }));
            [...tAtt].sort((a,b) => new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)).slice(0,2).forEach(a => events.push({
                dot:  a.status==='PRESENT' ? 'bg-green-400' : 'bg-red-400', text: `${a.userFullName||'Teacher'} marked ${a.status?.toLowerCase()}`, time: timeAgo(a.updatedAt||a.createdAt), ts: new Date(a.updatedAt||a.createdAt).getTime(),
            }));
            [...fs].filter(f=>f.status==='PAID').sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,2).forEach(f => events.push({
                dot:  'bg-green-400', text: `Fee payment received ₹${f.amount}`, time: timeAgo(f.updatedAt), ts: new Date(f.updatedAt).getTime(),
            }));

            events.sort((a,b) => b.ts-a.ts);
            setActivity(events.slice(0, 5));
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [orgId, today]);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    // Stats calculations
    const totalStudents  = students.length;
    const todayPresent   = todayAtt.filter(a => a.status === 'PRESENT').length;
    const todayAttPct    = totalStudents > 0 ? Math.round((todayPresent / totalStudents) * 100) : 0;
    
    const feeCollectedThisMonth = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const feePending = fees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE' || f.status === 'PARTIAL').reduce((sum, f) => sum + (f.remainingAmount || 0), 0);

    // Chart data
    const last7 = getLast7Days();
    const attChartData = last7.map(date => {
        const dayAtt = allAtt.filter(a => a.attendanceDate === date);
        return {
            day:     date.slice(5),
            Present: dayAtt.filter(a => a.status === 'PRESENT').length,
            Absent:  dayAtt.filter(a => a.status === 'ABSENT').length,
        };
    });

    const feePie = [
        { name: 'Paid',    value: fees.filter(f=>f.status==='PAID').length,    color: '#10b981' },
        { name: 'Pending', value: fees.filter(f=>f.status==='PENDING').length, color: '#f59e0b' },
        { name: 'Overdue', value: fees.filter(f=>f.status==='OVERDUE').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const attPie = [
        { name: 'Present',  value: todayAtt.filter(a=>a.status==='PRESENT').length,  color: '#10b981' },
        { name: 'Absent',   value: todayAtt.filter(a=>a.status==='ABSENT').length,   color: '#ef4444' },
        { name: 'Leave',    value: todayAtt.filter(a=>a.status==='ON_LEAVE').length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    // Mock bar chart data for fee collection
    const feeBarData = [
        { month: 'Mar', amount: 45000 },
        { month: 'Apr', amount: 52000 },
        { month: 'May', amount: 48000 },
        { month: 'Jun', amount: 61000 },
        { month: 'Jul', amount: 59000 },
        { month: 'Aug', amount: feeCollectedThisMonth || 10000 }, // using current month
    ];

    return (
        <SchoolLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto bg-gray-50/50 min-h-screen pb-12">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
                    <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute top-4 right-4 opacity-10">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    </div>
                    <div className="relative flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-violet-200 text-sm font-medium">{greeting} 👋</p>
                            <h2 className="text-2xl font-bold mt-0.5 tracking-tight">{user?.fullName || 'Admin'}</h2>
                            <p className="text-violet-300 text-sm mt-1">{user?.organizationName || 'Your School'} &nbsp;·&nbsp; {user?.role}</p>
                            <div className="flex gap-5 mt-4">
                                {[
                                    { label: 'Classrooms', value: loading ? '—' : classrooms.length },
                                    { label: 'Departments', value: loading ? '—' : departments.length },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xl font-bold">{s.value}</p>
                                        <p className="text-[10px] text-violet-200 font-medium uppercase tracking-wider">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {academicYear && (
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-right">
                                    <p className="text-[10px] font-medium text-violet-200 uppercase tracking-widest">Academic Year</p>
                                    <p className="text-sm font-bold mt-0.5">{academicYear.name}</p>
                                </div>
                            )}
                            <button onClick={fetchAll} disabled={loading} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-2 backdrop-blur-sm transition-colors group">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-white ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard 
                        label="Total Students" value={totalStudents} sub="Enrolled across all classes"
                        icon={Icons.students} iconBg="bg-blue-100 text-blue-600" gradient="bg-white border-gray-100"
                        onClick={() => navigate('/school/all-students')} loading={loading}
                    />
                    <StatCard 
                        label="Today's Attendance" value={`${todayAttPct}%`} sub={`${todayPresent} present today`}
                        icon={Icons.teachers} iconBg="bg-green-100 text-green-600" gradient="bg-white border-gray-100"
                        onClick={() => navigate('/school/classrooms')} loading={loading}
                        badge={todayAttPct < 75 ? 'Low' : 'Good'} badgeColor={todayAttPct < 75 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                    />
                    <StatCard 
                        label="Collected (This Month)" value={`₹${feeCollectedThisMonth.toLocaleString()}`} sub="Total fee received"
                        icon={Icons.fees} iconBg="bg-violet-100 text-violet-600" gradient="bg-white border-gray-100"
                        onClick={() => navigate('/school/all-fees')} loading={loading}
                    />
                    <StatCard 
                        label="Pending Fees" value={`₹${feePending.toLocaleString()}`} sub="Amount yet to be collected"
                        icon={Icons.fees} iconBg="bg-amber-100 text-amber-600" gradient="bg-white border-gray-100"
                        onClick={() => navigate('/school/all-fees')} loading={loading}
                    />
                </div>

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Bulk Attendance', icon: Icons.teachers, path: '/school/classrooms', bg: 'bg-green-50 text-green-700 hover:bg-green-100' },
                        { label: 'Fee Structure', icon: Icons.fees, path: '/school/fee-structure', bg: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                        { label: 'Post Notice', icon: Icons.announce, path: '/school/announcements', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                        { label: 'Academic Year', icon: Icons.classroom, path: '/school/academic-year', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                    ].map((card, i) => (
                        <button key={i} onClick={() => navigate(card.path)}
                            className={`rounded-2xl p-4 text-left transition-all duration-200 group flex items-center gap-4 border border-transparent shadow-sm ${card.bg}`}>
                            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{card.label}</p>
                                <p className="text-xs opacity-70 mt-0.5">Quick Link</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ── Charts Row 1 ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Fee Collection Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-base font-semibold text-gray-900">Fee Collection Trend</p>
                                <p className="text-xs text-gray-400 mt-1">Monthly collected amount</p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">Last 6 Months</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={feeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => `₹${v/1000}k`} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} content={<ChartTip />} />
                                    <Bar dataKey="amount" name="Collected" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Attendance Donut */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                        <div className="mb-4">
                            <p className="text-base font-semibold text-gray-900">Today's Attendance</p>
                            <p className="text-xs text-gray-400 mt-1">Live status across school</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-center relative min-h-[220px]">
                            {attPie.length === 0 && !loading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 font-medium">No attendance marked</div>
                            ) : (
                                <>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                                        <span className="text-2xl font-bold text-gray-800">{todayAttPct}%</span>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Present</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={attPie} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                                {attPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                            <Tooltip formatter={(v, n) => [v, n]} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={v => <span className="text-xs font-semibold text-gray-600">{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* Attendance Trend Line Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-base font-semibold text-gray-900">Attendance Trend</p>
                                <p className="text-xs text-gray-400 mt-1">Last 7 days overview</p>
                            </div>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorP)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Notice Board & Activity */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-semibold text-gray-900">Notice Board</p>
                            <button onClick={() => navigate('/school/announcements')} className="text-xs font-semibold text-violet-600 hover:underline">View All</button>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            {loading ? (
                                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}</div>
                            ) : announcements.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm font-medium">No notices</div>
                            ) : (
                                <div className="space-y-3">
                                    {announcements.map(a => (
                                        <div key={a.id} className="p-3 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate pr-2">{a.title}</h4>
                                                {a.priority === 'HIGH' && <span className="shrink-0 text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">HIGH</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{a.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Row 6: Teachers & Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Teachers Box */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-semibold text-gray-900">Teacher Summary</p>
                            <button onClick={() => navigate('/school/departments')} className="text-xs font-semibold text-violet-600 hover:underline">Manage</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                {Icons.teachers}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
                                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                <p className="text-xs font-medium text-gray-500">Present Today</p>
                                <p className="text-lg font-bold text-gray-800 mt-0.5">{todayAtt.filter(a => a.status==='PRESENT' && teachers.some(t => t.userId===a.userId)).length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                <p className="text-xs font-medium text-gray-500">On Leave</p>
                                <p className="text-lg font-bold text-gray-800 mt-0.5">{todayAtt.filter(a => a.status==='ON_LEAVE' && teachers.some(t => t.userId===a.userId)).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="mb-4">
                            <p className="text-base font-semibold text-gray-900">Recent Activity</p>
                            <p className="text-xs text-gray-400 mt-1">Live updates from across the school</p>
                        </div>
                        {loading ? (
                            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="flex gap-4"><div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"/><div className="h-4 w-48 bg-gray-100 animate-pulse mt-2"/></div>)}</div>
                        ) : activity.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-sm font-medium text-gray-400">No recent activity</div>
                        ) : (
                            <div className="space-y-4">
                                {activity.map((act, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="relative mt-1">
                                            <div className={`w-3 h-3 rounded-full ${act.dot} ring-4 ring-white relative z-10`} />
                                            {i !== activity.length - 1 && <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-100 -translate-x-1/2" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{act.text}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SchoolLayout>
    );
};

export default SchoolDashboard;
