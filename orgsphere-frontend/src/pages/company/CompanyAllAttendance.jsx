import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';

const STATUS_STYLE = {
    PRESENT:  'bg-green-50 text-green-700 border-green-100',
    ABSENT:   'bg-red-50 text-red-600 border-red-100',
    ON_LEAVE: 'bg-amber-50 text-amber-600 border-amber-100',
};

const CompanyAllAttendance = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    const [attendance,  setAttendance]  = useState([]);
    const [employees,   setEmployees]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [dateFilter,  setDateFilter]  = useState(today);
    const [statusFilter,setStatusFilter]= useState('ALL');
    const [search,      setSearch]      = useState('');

    useEffect(() => { load(); }, [dateFilter]);

    const load = async () => {
        setLoading(true);
        try {
            const [attRes, empRes] = await Promise.allSettled([
                companyApi.getAttendanceByDate(orgId, dateFilter),
                companyApi.getEmployeesByOrganization(orgId),
            ]);
            setAttendance(attRes.status === 'fulfilled' ? (attRes.value.data.data || []) : []);
            setEmployees(empRes.status  === 'fulfilled' ? (empRes.value.data.data  || []) : []);
        } catch { toast.error('Failed to load attendance'); }
        finally { setLoading(false); }
    };

    // Enrich attendance with department info
    const enriched = attendance.map(a => {
        const emp = employees.find(e => e.userId === a.userId);
        return { ...a, department: emp?.department || '—' };
    });

    const filtered = enriched.filter(a => {
        const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const matchSearch = !search ||
            a.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
            a.department?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const present  = attendance.filter(a => a.status === 'PRESENT').length;
    const absent   = attendance.filter(a => a.status === 'ABSENT').length;
    const onLeave  = attendance.filter(a => a.status === 'ON_LEAVE').length;

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/company/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Attendance</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Attendance Overview</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Attendance across all departments</p>
                    </div>
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Marked', value: attendance.length, color: 'bg-violet-50 text-violet-700 border-violet-100', f: 'ALL'      },
                        { label: 'Present',      value: present,           color: 'bg-green-50 text-green-700 border-green-100',    f: 'PRESENT'  },
                        { label: 'Absent',       value: absent,            color: 'bg-red-50 text-red-700 border-red-100',          f: 'ABSENT'   },
                        { label: 'On Leave',     value: onLeave,           color: 'bg-amber-50 text-amber-700 border-amber-100',    f: 'ON_LEAVE' },
                    ].map(s => (
                        <button key={s.label} onClick={() => setStatusFilter(s.f)}
                            className={`${s.color} border rounded-2xl px-4 py-3 text-left transition-all ${statusFilter === s.f ? 'ring-2 ring-offset-1 ring-violet-400 shadow-sm' : 'hover:shadow-sm'}`}>
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Search + status filter */}
                <div className="flex gap-3 flex-wrap items-center">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search employee or department..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <div className="flex gap-2">
                        {['ALL','PRESENT','ABSENT','ON_LEAVE'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                    statusFilter === s
                                        ? 'bg-violet-600 text-white border-violet-600'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                                }`}>{s === 'ALL' ? 'All' : s === 'ON_LEAVE' ? 'On Leave' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                        <p className="text-sm font-semibold text-gray-600">No attendance records</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {dateFilter === today ? 'No attendance marked today yet' : `No records for ${dateFilter}`}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Employee','Department','Date','Check In','Check Out','Status','Remarks','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(a => (
                                    <tr key={a.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{a.userFullName}</td>
                                        <td className="px-4 py-3.5">
                                            {a.department !== '—' ? (
                                                <button onClick={() => navigate(`/company/departments/${encodeURIComponent(a.department)}/attendance`)}
                                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                    {a.department}
                                                </button>
                                            ) : <span className="text-gray-300 text-sm">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{a.attendanceDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{a.checkInTime  || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{a.checkOutTime || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[a.status] || ''}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-400">{a.remarks || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            {a.department !== '—' && (
                                                <button onClick={() => navigate(`/company/departments/${encodeURIComponent(a.department)}/attendance`)}
                                                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold hover:underline">
                                                    View Dept
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default CompanyAllAttendance;
