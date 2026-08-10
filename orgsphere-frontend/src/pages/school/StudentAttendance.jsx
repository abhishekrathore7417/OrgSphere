import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { companyApi } from '../../api/companyApi';
import SchoolLayout from '../../components/layout/SchoolLayout';

/* ── Status config ── */
const STATUS = {
    PRESENT:  { label: 'Present',  bg: 'bg-green-500',  light: 'bg-green-50 border-green-200 text-green-700',  icon: '✓' },
    ABSENT:   { label: 'Absent',   bg: 'bg-red-500',    light: 'bg-red-50 border-red-200 text-red-600',         icon: '✗' },
    ON_LEAVE: { label: 'On Leave', bg: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200 text-amber-600',   icon: '⏤' },
};

export default function StudentAttendance() {
    const { classroomId } = useParams();
    const navigate        = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const todayStr = new Date().toISOString().split('T')[0];

    const [classroom,   setClassroom]   = useState(null);
    const [students,    setStudents]    = useState([]);
    const [bulkStatus,  setBulkStatus]  = useState({});
    const [allRecords,  setAllRecords]  = useState([]);
    const [tab,         setTab]         = useState('bulk'); // 'bulk' | 'history' | 'monthly'
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [historyDate, setHistoryDate] = useState('');
    const [todayLocked, setTodayLocked] = useState(false); // true if today's attendance already saved

    /* ── Load classroom + students ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            const c  = cr.data.data;
            setClassroom(c);

            const stuRes = await schoolApi.getStudentsByClassroom(classroomId);
            // Only ACTIVE students in attendance marking
            const stuList = (stuRes.data.data || [])
                .filter(s => s.status === 'ACTIVE')
                .map(s => ({ userId: s.userId, name: s.userFullName, studentId: s.studentId }));
            setStudents(stuList);

            const attRes  = await schoolApi.getAttendanceByOrganization(orgId);
            const allAtt  = attRes.data.data || [];
            const stuUserIds = new Set(stuList.map(s => s.userId));
            const filtered = allAtt.filter(a => stuUserIds.has(a.userId));
            setAllRecords(filtered);

            // Check if today's attendance is already saved (locked)
            const todayRecords = filtered.filter(a => a.attendanceDate === todayStr);
            const isLocked = stuList.length > 0 && todayRecords.length >= stuList.length;
            setTodayLocked(isLocked);

            // Pre-fill bulk status for today
            fillBulkForDate(stuList, filtered, todayStr);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    }, [classroomId, orgId]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── Pre-fill bulk grid for a date ── */
    const fillBulkForDate = (stuList, records, d) => {
        const map = {};
        stuList.forEach(s => {
            const existing = records.find(r => r.userId === s.userId && r.attendanceDate === d);
            map[s.userId] = existing
                ? { status: existing.status, remarks: existing.remarks || '', existingId: existing.id }
                : { status: 'PRESENT', remarks: '', existingId: null };
        });
        setBulkStatus(map);
    };

    /* ── Mark All ── */
    const markAll = (status) => {
        if (todayLocked) return;
        setBulkStatus(prev => {
            const next = { ...prev };
            students.forEach(s => { next[s.userId] = { ...next[s.userId], status }; });
            return next;
        });
    };

    /* ── Toggle single student status ── */
    const cycleStatus = (userId) => {
        if (todayLocked) return;
        const order = ['PRESENT', 'ABSENT', 'ON_LEAVE'];
        setBulkStatus(prev => {
            const cur = prev[userId]?.status || 'PRESENT';
            const next = order[(order.indexOf(cur) + 1) % order.length];
            return { ...prev, [userId]: { ...prev[userId], status: next } };
        });
    };

    /* ── Save bulk attendance (today only, once) ── */
    const handleSaveAll = async () => {
        if (todayLocked) {
            toast.info("Today's attendance is already saved and cannot be changed.");
            return;
        }
        if (students.length === 0) return toast.warn('No students in this classroom');
        setSaving(true);
        let saved = 0, failed = 0;
        try {
            await Promise.all(students.map(async (s) => {
                const entry = bulkStatus[s.userId] || { status: 'PRESENT', remarks: '' };
                const payload = {
                    userId:         s.userId,
                    organizationId: parseInt(orgId),
                    attendanceDate: todayStr,
                    status:         entry.status,
                    remarks:        entry.remarks || '',
                };
                try {
                    // Only create, never update (locked after save)
                    if (!entry.existingId) {
                        await schoolApi.markAttendance(payload);                    }
                    saved++;
                } catch { failed++; }
            }));
            if (failed === 0) toast.success(`✓ Attendance saved for ${saved} students`);
            else toast.warn(`Saved ${saved}, failed ${failed}`);
            await loadData();
        } finally { setSaving(false); }
    };

    /* ── Derived stats for today ── */
    const stats = students.reduce((acc, s) => {
        const st = bulkStatus[s.userId]?.status || 'PRESENT';
        acc[st] = (acc[st] || 0) + 1;
        return acc;
    }, {});
    const presentPct = students.length > 0 ? Math.round(((stats.PRESENT || 0) / students.length) * 100) : 0;

    /* ── History tab: filter by selected date ── */
    const historyRecords = historyDate
        ? allRecords.filter(a => a.attendanceDate === historyDate)
        : [...allRecords].sort((a, b) => b.attendanceDate?.localeCompare(a.attendanceDate));

    /* ── Monthly report: group by student, calculate % ── */
    const monthlyReport = students.map(s => {
        const stuRecords = allRecords.filter(r => r.userId === s.userId);
        const total      = stuRecords.length;
        const present    = stuRecords.filter(r => r.status === 'PRESENT').length;
        const absent     = stuRecords.filter(r => r.status === 'ABSENT').length;
        const onLeave    = stuRecords.filter(r => r.status === 'ON_LEAVE').length;
        const pct        = total > 0 ? Math.round((present / total) * 100) : 0;
        return { ...s, total, present, absent, onLeave, pct };
    });

    const label = classroom?.classroomName || `Classroom #${classroomId}`;

    return (
        <SchoolLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-5">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <button onClick={() => navigate('/school/classrooms')} className="hover:text-violet-600 transition-colors">Classrooms</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <button onClick={() => navigate(`/school/classrooms/${classroomId}/students`)} className="hover:text-violet-600 transition-colors">{label}</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">Attendance</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Student Attendance</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{label} · {students.length} students · <span className="font-medium text-gray-600">{todayStr}</span></p>
                    </div>
                    {/* Tab switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        <button onClick={() => setTab('bulk')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'bulk' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            Mark Today
                        </button>
                        <button onClick={() => setTab('history')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'history' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            History
                        </button>
                        <button onClick={() => setTab('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'monthly' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            Monthly Report
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <div className="w-8 h-8 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tab === 'bulk' ? (
                    <>
                        {/* Lock notice */}
                        {todayLocked && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <div>
                                    <p className="text-sm font-semibold text-amber-700">Attendance Locked</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Today's attendance has been saved and cannot be modified.</p>
                                </div>
                            </div>
                        )}

                        {/* Actions bar */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-sm font-semibold text-gray-700">{todayStr}</span>
                                <span className="text-xs text-gray-400">(Today Only)</span>
                            </div>
                            {!todayLocked && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <button onClick={() => markAll('PRESENT')}  className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">All Present</button>
                                    <button onClick={() => markAll('ABSENT')}   className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">All Absent</button>
                                    <button onClick={() => markAll('ON_LEAVE')} className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">All On Leave</button>
                                </div>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Total',    value: students.length,       color: 'text-gray-800',  bg: 'bg-gray-50 border-gray-100' },
                                { label: 'Present',  value: stats.PRESENT  || 0,  color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
                                { label: 'Absent',   value: stats.ABSENT   || 0,  color: 'text-red-600',   bg: 'bg-red-50 border-red-100' },
                                { label: 'On Leave', value: stats.ON_LEAVE || 0, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Attendance % bar */}
                        {students.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${presentPct >= 75 ? 'bg-green-500' : presentPct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                        style={{ width: `${presentPct}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-bold ${presentPct >= 75 ? 'text-green-700' : presentPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{presentPct}%</span>
                            </div>
                        )}

                        {/* Student cards grid */}
                        {students.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                <p className="text-sm font-medium text-gray-600">No students in this classroom</p>
                                <p className="text-xs text-gray-400 mt-1">Add students first from the Students tab</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {students.map((s) => {
                                    const entry = bulkStatus[s.userId] || { status: 'PRESENT', remarks: '' };
                                    const cfg   = STATUS[entry.status] || STATUS.PRESENT;
                                    return (
                                        <div key={s.userId} className={`bg-white rounded-xl border-2 transition-all duration-200 p-4 ${todayLocked ? 'opacity-80' : ''} ${entry.status === 'PRESENT' ? 'border-green-200' : entry.status === 'ABSENT' ? 'border-red-200' : 'border-amber-200'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center text-white text-sm font-bold`}>
                                                        {s.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 leading-tight">{s.name}</p>
                                                        {s.studentId && <p className="text-[10px] text-gray-400 mt-0.5">{s.studentId}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => cycleStatus(s.userId)}
                                                    disabled={todayLocked}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${cfg.light} ${todayLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                                >
                                                    {cfg.label}
                                                </button>
                                            </div>
                                            {!todayLocked && (
                                                <input
                                                    type="text"
                                                    placeholder="Remarks (optional)"
                                                    value={entry.remarks}
                                                    onChange={e => setBulkStatus(prev => ({ ...prev, [s.userId]: { ...prev[s.userId], remarks: e.target.value } }))}
                                                    className="w-full text-xs border border-gray-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-300 bg-gray-50 placeholder-gray-300"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Save button */}
                        {students.length > 0 && !todayLocked && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={saving}
                                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-8 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    {saving ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Save Attendance ({students.length} students)</>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : tab === 'history' ? (
                    /* ── History tab ── */
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <label className="text-sm font-medium text-gray-600">Filter by Date:</label>
                            <input
                                type="date"
                                value={historyDate}
                                max={todayStr}
                                onChange={e => setHistoryDate(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                            {historyDate && (
                                <button onClick={() => setHistoryDate('')} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
                            )}
                            <span className="ml-auto text-xs text-gray-400">{historyRecords.length} records</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                            {historyRecords.length === 0 ? (
                                <div className="p-16 text-center">
                                    <p className="text-sm font-medium text-gray-600">No attendance records found</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            {['Student', 'Date', 'Status', 'Remarks'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {historyRecords.map(a => (
                                            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-700">{a.userFullName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{a.attendanceDate}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS[a.status]?.light || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                        {STATUS[a.status]?.label || a.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-400">{a.remarks || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Monthly Report tab ── */
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-sm text-gray-500">Student-wise attendance summary across all recorded dates. Students with attendance below <span className="font-bold text-red-600">75%</span> are highlighted.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                            {monthlyReport.length === 0 ? (
                                <div className="p-16 text-center">
                                    <p className="text-sm font-medium text-gray-600">No data available</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            {['Student', 'Total Days', 'Present', 'Absent', 'On Leave', 'Attendance %', 'Status'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {monthlyReport.map(s => (
                                            <tr key={s.userId} className={`hover:bg-gray-50 transition-colors ${s.pct < 75 && s.total > 0 ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">
                                                            {s.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{s.name}</p>
                                                            <p className="text-[10px] text-gray-400">{s.studentId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-gray-600 font-medium">{s.total}</td>
                                                <td className="px-4 py-3.5 text-sm text-green-700 font-medium">{s.present}</td>
                                                <td className="px-4 py-3.5 text-sm text-red-600 font-medium">{s.absent}</td>
                                                <td className="px-4 py-3.5 text-sm text-amber-600 font-medium">{s.onLeave}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${s.pct >= 75 ? 'bg-green-500' : s.pct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                                style={{ width: `${s.pct}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-bold ${s.pct >= 75 ? 'text-green-700' : s.pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{s.pct}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {s.total === 0 ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100">No Data</span>
                                                    ) : s.pct >= 75 ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">Good</span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">⚠ Low</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
}
