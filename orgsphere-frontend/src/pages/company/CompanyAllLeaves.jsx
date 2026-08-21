import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';

const STATUS_STYLE = {
    PENDING:  'bg-amber-50 text-amber-600 border-amber-100',
    APPROVED: 'bg-green-50 text-green-700 border-green-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100',
};

const CompanyAllLeaves = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [leaves,     setLeaves]     = useState([]);
    const [employees,  setEmployees]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [filter,     setFilter]     = useState('ALL');
    const [search,     setSearch]     = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [leaveRes, empRes] = await Promise.allSettled([
                companyApi.getLeavesByOrganization(orgId),
                companyApi.getEmployeesByOrganization(orgId),
            ]);
            setLeaves(leaveRes.status   === 'fulfilled' ? (leaveRes.value.data.data || []) : []);
            setEmployees(empRes.status  === 'fulfilled' ? (empRes.value.data.data   || []) : []);
        } catch { toast.error('Failed to load leaves'); }
        finally { setLoading(false); }
    };

    // Enrich leaves with department info from employees mapping
    const enriched = leaves.map(l => {
        const emp = employees.find(e => e.userId === l.userId);
        return { ...l, department: emp?.department || '—' };
    });

    const filtered = enriched.filter(l => {
        const matchStatus = filter === 'ALL' || l.status === filter;
        const matchSearch = !search ||
            l.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
            l.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
            l.department?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const approve = async (id) => {
        try { await companyApi.approveLeave(id); toast.success('Approved'); load(); }
        catch { toast.error('Failed to approve'); }
    };
    const reject = async (id) => {
        try { await companyApi.rejectLeave(id); toast.success('Rejected'); load(); }
        catch { toast.error('Failed to reject'); }
    };

    const pending  = leaves.filter(l => l.status === 'PENDING').length;
    const approved = leaves.filter(l => l.status === 'APPROVED').length;
    const rejected = leaves.filter(l => l.status === 'REJECTED').length;

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/company/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Leaves</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Leave Requests</h2>
                        <p className="text-sm text-gray-400 mt-0.5">All leave applications across departments</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total',    value: leaves.length, color: 'bg-violet-50 text-violet-700 border-violet-100',  filter: 'ALL'      },
                        { label: 'Pending',  value: pending,       color: 'bg-amber-50 text-amber-700 border-amber-100',     filter: 'PENDING'  },
                        { label: 'Approved', value: approved,      color: 'bg-green-50 text-green-700 border-green-100',     filter: 'APPROVED' },
                        { label: 'Rejected', value: rejected,      color: 'bg-red-50 text-red-700 border-red-100',           filter: 'REJECTED' },
                    ].map(s => (
                        <button key={s.label} onClick={() => setFilter(s.filter)}
                            className={`${s.color} border rounded-2xl px-4 py-3 text-left transition-all ${filter === s.filter ? 'ring-2 ring-offset-1 ring-violet-400 shadow-sm' : 'hover:shadow-sm'}`}>
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search employee, type, department..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <div className="flex gap-2">
                        {['ALL','PENDING','APPROVED','REJECTED'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                    filter === s
                                        ? 'bg-violet-600 text-white border-violet-600'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                                }`}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
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
                        <p className="text-sm font-semibold text-gray-600">No leave requests</p>
                        <p className="text-xs text-gray-400 mt-1">No records match your filter</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Employee','Department','Type','From','To','Reason','Status','Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(l => (
                                    <tr key={l.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{l.userFullName}</td>
                                        <td className="px-4 py-3.5">
                                            {l.department !== '—' ? (
                                                <button onClick={() => navigate(`/company/departments/${encodeURIComponent(l.department)}/leaves`)}
                                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                    {l.department}
                                                </button>
                                            ) : <span className="text-gray-300 text-sm">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-600">{l.leaveType}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{l.startDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{l.endDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-400 max-w-32 truncate">{l.reason || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[l.status] || ''}`}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {l.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => approve(l.id)} className="text-xs text-green-600 hover:text-green-800 font-semibold">Approve</button>
                                                    <button onClick={() => reject(l.id)}  className="text-xs text-red-500 hover:text-red-700 font-semibold">Reject</button>
                                                </div>
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

export default CompanyAllLeaves;
