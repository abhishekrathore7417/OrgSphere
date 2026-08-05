import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import SchoolLayout from '../../components/layout/SchoolLayout';
import { schoolApi } from '../../api/schoolApi';
import { companyApi } from '../../api/companyApi';

/* ── Icons ──────────────────────────────────────────────────── */
const Icons = {
    students:  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    teachers:  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    classroom: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    fees:      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    dept:      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    refresh:   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    arrow:     <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
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

/* ── Chart Tooltip ──────────────────────────────────────────── */
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
    const [students,    setStudents]    = useState([]);
    const [teachers,    setTeachers]    = useState([]);
    const [classrooms,  setClassrooms]  = useState([]);
    const [departments, setDepartments] = useState([]);
    const [fees,        setFees]        = useState([]);
    const [todayAtt,    setTodayAtt]    = useState([]);
    const [allAtt,      setAllAtt]      = useState([]);
    const [activity,    setActivity]    = useState([]);

    /* ── Derived stats ── */
    const totalStudents  = students.length;
    const totalTeachers  = teachers.length;
    const totalClassrooms= classrooms.length;
    const pendingFees    = fees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length;
    const todayPresent   = todayAtt.filter(a => a.status === 'PRESENT').length;
    const todayAbsent    = todayAtt.filter(a => a.status === 'ABSENT').length;

    const fetchAll = useCallback(async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [stuR, tchR, clsR, deptR, feeR, todayR, allAttR] = await Promise.allSettled([
                schoolApi.getStudentsByOrganization(orgId),
                schoolApi.getTeachersByOrganization(orgId),
                schoolApi.getClassroomsByOrganization(orgId),
                companyApi.getDepartmentsByOrganization(orgId),
                schoolApi.getFeesByOrganization(orgId),
                companyApi.getAttendanceByDate(orgId, today),
                companyApi.getAttendanceByOrganization(orgId),
            ]);

            const stus   = stuR.status    === 'fulfilled' ? (stuR.value.data.data    || []) : [];
            const tchs   = tchR.status    === 'fulfilled' ? (tchR.value.data.data    || []) : [];
            const clss   = clsR.status    === 'fulfilled' ? (clsR.value.data.data    || []) : [];
            const depts  = deptR.status   === 'fulfilled' ? (deptR.value.data.data   || []) : [];
            const fs     = feeR.status    === 'fulfilled' ? (feeR.value.data.data    || []) : [];
            const tAtt   = todayR.status  === 'fulfilled' ? (todayR.value.data.data  || []) : [];
            const aAtt   = allAttR.status === 'fulfilled' ? (allAttR.value.data.data || []) : [];

            setStudents(stus);
            setTeachers(tchs);
            setClassrooms(clss);
            setDepartments(depts);
            setFees(fs);
            setTodayAtt(tAtt);
            setAllAtt(aAtt);

            /* ── Build activity feed ── */
            const events = [];

            // Latest students enrolled
            [...stus].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))
                .slice(0,2).forEach(s => events.push({
                    dot:  'bg-violet-400',
                    text: `${s.userFullName||'Student'} enrolled in ${clss.find(c=>c.id===s.classroomId)?.classroomName||'a classroom'}`,
                    time: timeAgo(s.createdAt),
                    ts:   new Date(s.createdAt).getTime(),
                }));

            // Today attendance
            [...tAtt].sort((a,b) => new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))
                .slice(0,2).forEach(a => events.push({
                    dot:  a.status==='PRESENT' ? 'bg-green-400' : 'bg-red-400',
                    text: `${a.userFullName||'Teacher'} marked ${a.status?.toLowerCase()} today`,
                    time: timeAgo(a.updatedAt||a.createdAt),
                    ts:   new Date(a.updatedAt||a.createdAt).getTime(),
                }));

            // Recent fee payments
            [...fs].filter(f=>f.status==='PAID').sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))
                .slice(0,2).forEach(f => events.push({
                    dot:  'bg-green-400',
                    text: `Fee payment received${f.amount ? ` ₹${f.amount}` : ''}`,
                    time: timeAgo(f.updatedAt),
                    ts:   new Date(f.updatedAt).getTime(),
                }));

            // Recent classrooms
            [...clss].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
                .slice(0,1).forEach(c => events.push({
                    dot:  'bg-indigo-400',
                    text: `Classroom "${c.classroomName}" created`,
                    time: timeAgo(c.createdAt),
                    ts:   new Date(c.createdAt).getTime(),
                }));

            events.sort((a,b) => b.ts-a.ts);
            setActivity(events.slice(0,6));
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

    const feePie = [
        { name: 'Paid',    value: fees.filter(f=>f.status==='PAID').length,    color: '#10b981' },
        { name: 'Pending', value: fees.filter(f=>f.status==='PENDING').length, color: '#f59e0b' },
        { name: 'Overdue', value: fees.filter(f=>f.status==='OVERDUE').length, color: '#ef4444' },
        { name: 'Partial', value: fees.filter(f=>f.status==='PARTIAL').length, color: '#6366f1' },
    ].filter(d => d.value > 0);

    const attPie = [
        { name: 'Present',  value: todayAtt.filter(a=>a.status==='PRESENT').length,  color: '#10b981' },
        { name: 'Absent',   value: todayAtt.filter(a=>a.status==='ABSENT').length,   color: '#ef4444' },
        { name: 'On Leave', value: todayAtt.filter(a=>a.status==='ON_LEAVE').length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const firstClassroom = classrooms[0];
    const firstDept      = departments[0];
    const clsPath  = firstClassroom ? `/school/classrooms/${firstClassroom.id}/students` : '/school/classrooms';
    const deptPath = firstDept ? `/school/departments/${encodeURIComponent(firstDept.name||firstDept.departmentName)}/teachers` : '/school/departments';

    return (
        <SchoolLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
                    <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute top-4 right-6 opacity-10">
                        <svg width="110" height="110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    </div>
                    <div className="relative flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-violet-200 text-sm font-medium">{greeting} 👋</p>
                            <h2 className="text-2xl font-black mt-0.5 tracking-tight">{user?.fullName || 'Admin'}</h2>
                            <p className="text-violet-300 text-sm mt-1">{user?.organizationName || 'Your School'} &nbsp;·&nbsp; {user?.role}</p>
                            <div className="flex gap-5 mt-4 flex-wrap">
                                {[
                                    { label: 'Students',   value: loading ? '…' : totalStudents   },
                                    { label: 'Teachers',   value: loading ? '…' : totalTeachers   },
                                    { label: 'Classrooms', value: loading ? '…' : totalClassrooms },
                                    { label: 'Departments',value: loading ? '…' : departments.length },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xl font-black">{s.value}</p>
                                        <p className="text-xs text-violet-300 mt-0.5 whitespace-nowrap">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-start">
                            <button onClick={() => navigate(clsPath)}
                                className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2 rounded-xl border border-white/20 transition-colors backdrop-blur-sm">
                                + Add Student
                            </button>
                            <button onClick={() => navigate('/school/all-fees')}
                                className="bg-white text-violet-700 hover:bg-violet-50 text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow">
                                View Fees
                            </button>
                            <button onClick={fetchAll} title="Refresh"
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/20 transition-colors">
                                {Icons.refresh}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        loading={loading} label="Total Students" value={totalStudents}
                        sub="Across all classrooms"
                        badge="Enrolled" badgeColor="bg-violet-100 text-violet-700"
                        icon={<span className="text-violet-600">{Icons.students}</span>}
                        gradient="bg-white border-violet-100" iconBg="bg-violet-50"
                        onClick={() => navigate('/school/all-students')}
                    />
                    <StatCard
                        loading={loading} label="Teachers" value={totalTeachers}
                        sub="Across all departments"
                        badge="Staff" badgeColor="bg-indigo-100 text-indigo-700"
                        icon={<span className="text-indigo-600">{Icons.teachers}</span>}
                        gradient="bg-white border-indigo-100" iconBg="bg-indigo-50"
                        onClick={() => navigate('/school/all-teachers')}
                    />
                    <StatCard
                        loading={loading} label="Classrooms" value={totalClassrooms}
                        sub={`${departments.length} departments`}
                        badge="Active" badgeColor="bg-cyan-100 text-cyan-700"
                        icon={<span className="text-cyan-600">{Icons.classroom}</span>}
                        gradient="bg-white border-cyan-100" iconBg="bg-cyan-50"
                        onClick={() => navigate('/school/classrooms')}
                    />
                    <StatCard
                        loading={loading} label="Fees Pending" value={pendingFees}
                        sub={fees.filter(f=>f.status==='OVERDUE').length > 0 ? `${fees.filter(f=>f.status==='OVERDUE').length} overdue` : 'No overdue fees'}
                        badge="Due" badgeColor="bg-amber-100 text-amber-700"
                        icon={<span className="text-amber-600">{Icons.fees}</span>}
                        gradient="bg-white border-amber-100" iconBg="bg-amber-50"
                        onClick={() => navigate('/school/all-fees')}
                    />
                </div>

                {/* ── Section Labels ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Students summary */}
                    <div className="bg-white rounded-2xl border border-violet-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
                         onClick={() => navigate('/school/all-students')}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                {Icons.students}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Students</p>
                                <p className="text-xs text-gray-400 mt-0.5">{totalStudents} enrolled across {totalClassrooms} classrooms</p>
                                <div className="flex gap-3 mt-1.5">
                                    <span className="text-xs text-green-600 font-semibold">{students.filter(s=>s.status==='ACTIVE').length} Active</span>
                                    <span className="text-xs text-blue-500 font-semibold">{students.filter(s=>s.status==='ALUMNI').length} Alumni</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-violet-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View all {Icons.arrow}
                        </div>
                    </div>
                    {/* Teachers summary */}
                    <div className="bg-white rounded-2xl border border-indigo-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
                         onClick={() => navigate('/school/all-teachers')}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                {Icons.teachers}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Teachers</p>
                                <p className="text-xs text-gray-400 mt-0.5">{totalTeachers} teachers across {departments.length} departments</p>
                                <div className="flex gap-3 mt-1.5">
                                    <span className="text-xs text-green-600 font-semibold">{teachers.filter(t=>t.status==='ACTIVE').length} Active</span>
                                    <span className="text-xs text-gray-400 font-semibold">{teachers.filter(t=>t.status==='INACTIVE').length} Inactive</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-violet-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View all {Icons.arrow}
                        </div>
                    </div>
                </div>

                {/* ── Charts Row 1: Attendance Trend + Today Attendance ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Attendance area chart — 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Teacher Attendance Trend</p>
                                <p className="text-xs text-gray-400 mt-0.5">Last 7 days — Present vs Absent</p>
                            </div>
                            <button onClick={() => navigate(deptPath)}
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
                                        <linearGradient id="sgPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="sgAbsent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="Present" stroke="#7c3aed" strokeWidth={2.5} fill="url(#sgPresent)" dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
                                    <Area type="monotone" dataKey="Absent"  stroke="#ef4444" strokeWidth={2}   fill="url(#sgAbsent)"  dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                        <div className="flex gap-5 mt-3">
                            <div className="flex items-center gap-2"><span className="w-3 h-0.5 rounded bg-violet-600 inline-block"/><span className="text-xs text-gray-500 font-medium">Present</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-0.5 rounded bg-red-400 inline-block"/><span className="text-xs text-gray-500 font-medium">Absent</span></div>
                        </div>
                    </div>

                    {/* Today attendance pie — 1 col */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Today's Attendance</p>
                                <p className="text-xs text-gray-400 mt-0.5">{today}</p>
                            </div>
                            <button onClick={() => navigate(deptPath)}
                                className="flex items-center gap-1 text-xs text-violet-600 font-bold hover:underline">
                                View {Icons.arrow}
                            </button>
                        </div>
                        {loading ? (
                            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                        ) : attPie.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-300">
                                <p className="text-sm font-medium">No attendance today</p>
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

                {/* ── Charts Row 2: Fee Pie + Recent Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Fee status pie — 1 col */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Fee Status</p>
                                <p className="text-xs text-gray-400 mt-0.5">All fee records</p>
                            </div>
                            <button onClick={() => navigate('/school/all-fees')}
                                className="flex items-center gap-1 text-xs text-violet-600 font-bold hover:underline">
                                View {Icons.arrow}
                            </button>
                        </div>
                        {loading ? (
                            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                        ) : feePie.length === 0 ? (
                            <div className="h-44 flex items-center justify-center text-gray-300 text-sm font-medium">No fee data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={176}>
                                <PieChart>
                                    <Pie data={feePie} cx="50%" cy="45%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {feePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v, n]} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Recent Activity — 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Recent Activity</p>
                                <p className="text-xs text-gray-400 mt-0.5">Latest actions in your school</p>
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
                            { label: 'Students',   sub: `${totalStudents} enrolled`,     icon: Icons.students,  path: '/school/all-students', iconBg: 'bg-violet-100 text-violet-600' },
                            { label: 'Teachers',   sub: `${totalTeachers} active`,        icon: Icons.teachers,  path: '/school/all-teachers', iconBg: 'bg-indigo-100 text-indigo-600' },
                            { label: 'Fees',       sub: `${pendingFees} pending`,         icon: Icons.fees,      path: '/school/all-fees',     iconBg: 'bg-amber-100 text-amber-600'   },
                            { label: 'Classrooms', sub: `${totalClassrooms} classrooms`,  icon: Icons.classroom, path: '/school/classrooms',   iconBg: 'bg-cyan-100 text-cyan-600'     },
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
        </SchoolLayout>
    );
};

export default SchoolDashboard;
