import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const STATUS_STYLE = {
    PENDING:  'bg-amber-50 text-amber-600 border-amber-100',
    PAID:     'bg-green-50 text-green-700 border-green-100',
    OVERDUE:  'bg-red-50 text-red-600 border-red-100',
    WAIVED:   'bg-gray-50 text-gray-500 border-gray-100',
    PARTIAL:  'bg-blue-50 text-blue-600 border-blue-100',
};

const SchoolAllFees = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [fees,       setFees]       = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [students,   setStudents]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [filter,     setFilter]     = useState('ALL');
    const [search,     setSearch]     = useState('');
    const [paying,     setPaying]     = useState(null);  // feeId being paid
    const [payAmount,  setPayAmount]  = useState('');
    const [payModal,   setPayModal]   = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [feeRes, clsRes, stuRes] = await Promise.allSettled([
                schoolApi.getFeesByOrganization(orgId),
                schoolApi.getClassroomsByOrganization(orgId),
                schoolApi.getStudentsByOrganization(orgId),
            ]);
            setFees(feeRes.status       === 'fulfilled' ? (feeRes.value.data.data  || []) : []);
            setClassrooms(clsRes.status === 'fulfilled' ? (clsRes.value.data.data  || []) : []);
            setStudents(stuRes.status   === 'fulfilled' ? (stuRes.value.data.data  || []) : []);
        } catch { toast.error('Failed to load fees'); }
        finally { setLoading(false); }
    };

    // Enrich fees with classroom info via student mapping
    const enriched = fees.map(f => {
        // f.studentId is the DB id of student record
        const student = students.find(s => s.id === f.studentId);
        // Match student's className to classroom's classroomName
        const classroom = student
            ? classrooms.find(c =>
                c.classroomName === student.className ||
                c.classroomName?.toLowerCase() === student.className?.toLowerCase()
              )
            : null;
        return {
            ...f,
            studentName:   student?.userFullName || f.studentName || '—',
            classroomId:   classroom?.id || null,
            classroomName: classroom?.classroomName || (student?.className || '—'),
        };
    });

    const openPay = (fee) => {
        setPaying(fee.id);
        setPayAmount(fee.amount ? String(fee.amount) : '');
        setPayModal(true);
    };

    const handlePay = async () => {
        if (!paying || !payAmount) return;
        try {
            await schoolApi.payFee(paying, parseFloat(payAmount));
            toast.success('Payment recorded successfully');
            setPayModal(false);
            setPaying(null);
            setPayAmount('');
            load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Payment failed'); }
    };

    const filtered = enriched.filter(f => {
        const matchFilter = filter === 'ALL' || f.status === filter;
        const matchSearch = !search ||
            f.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            f.feeType?.toLowerCase().includes(search.toLowerCase()) ||
            f.classroomName?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const paid    = fees.filter(f => f.status === 'PAID').length;
    const pending = fees.filter(f => f.status === 'PENDING').length;
    const overdue = fees.filter(f => f.status === 'OVERDUE').length;
    const totalAmt = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Fees</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Fee Records</h2>
                        <p className="text-sm text-gray-400 mt-0.5">All fee records across classrooms</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Records', value: fees.length,   color: 'bg-violet-50 text-violet-700 border-violet-100', f: 'ALL'     },
                        { label: 'Pending',        value: pending,       color: 'bg-amber-50 text-amber-700 border-amber-100',    f: 'PENDING' },
                        { label: 'Paid',           value: paid,          color: 'bg-green-50 text-green-700 border-green-100',    f: 'PAID'    },
                        { label: 'Overdue',        value: overdue,       color: 'bg-red-50 text-red-700 border-red-100',          f: 'OVERDUE' },
                    ].map(s => (
                        <button key={s.label} onClick={() => setFilter(s.f)}
                            className={`${s.color} border rounded-2xl px-4 py-3 text-left transition-all ${filter === s.f ? 'ring-2 ring-offset-1 ring-violet-400 shadow-sm' : 'hover:shadow-sm'}`}>
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Total collected banner */}
                {totalAmt > 0 && (
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-5 py-4 text-white flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-violet-200">Total Collected</p>
                            <p className="text-2xl font-black mt-0.5">₹{totalAmt.toLocaleString()}</p>
                        </div>
                        <div className="text-xs text-violet-200 text-right">
                            <p>{paid} payments received</p>
                            <p className="mt-0.5">{overdue} overdue</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search student, fee type, classroom..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <div className="flex gap-2 flex-wrap">
                        {['ALL','PENDING','PAID','OVERDUE','PARTIAL','WAIVED'].map(s => (
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
                        <p className="text-sm font-semibold text-gray-600">No fee records</p>
                        <p className="text-xs text-gray-400 mt-1">No records match your filter</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Student','Classroom','Fee Type','Amount','Paid','Due Date','Status','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(f => (
                                    <tr key={f.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{f.studentName}</td>
                                        <td className="px-4 py-3.5">
                                            {f.classroomId ? (
                                                <button onClick={() => navigate(`/school/classrooms/${f.classroomId}/fees`)}
                                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                    {f.classroomName}
                                                </button>
                                            ) : <span className="text-gray-300 text-sm">{f.classroomName}</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-600">{f.feeType || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                            {f.amount ? `₹${f.amount.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-green-700 font-semibold">
                                            {f.paidAmount ? `₹${f.paidAmount.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{f.dueDate || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[f.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex gap-2 flex-wrap">
                                                {(f.status === 'PENDING' || f.status === 'OVERDUE' || f.status === 'PARTIAL') && (
                                                    <button onClick={() => openPay(f)}
                                                        className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-green-100 transition-colors">
                                                        Pay
                                                    </button>
                                                )}
                                                {f.classroomId && (
                                                    <button onClick={() => navigate(`/school/classrooms/${f.classroomId}/fees`)}
                                                        className="text-xs text-violet-600 hover:text-violet-800 font-semibold hover:underline">
                                                        View
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pay Modal */}
            <Modal open={payModal} onClose={() => { setPayModal(false); setPaying(null); }} title="Record Payment">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Amount (₹) *</label>
                        <input
                            type="number" step="0.01" value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            placeholder="Enter amount paid"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={() => { setPayModal(false); setPaying(null); }}
                            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={handlePay} disabled={!payAmount}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60">
                            Confirm Payment
                        </button>
                    </div>
                </div>
            </Modal>
        </SchoolLayout>
    );
};

export default SchoolAllFees;
