import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    PAID:    'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
    OVERDUE: 'bg-red-50 text-red-600 border-red-200',
    PARTIAL: 'bg-violet-50 text-violet-600 border-violet-200',
    WAIVED:  'bg-gray-50 text-gray-500 border-gray-200',
};

const OVERALL_STATUS_STYLE = {
    PAID:    'bg-green-50 text-green-700 border border-green-200 font-semibold',
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    OVERDUE: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
};

const EMPTY_FEE = { feeType: 'SCHOOL', amount: '', dueDate: '', description: '', studentId: '' };

function StudentFeeCard({ sg, pal, totalFees, totalPaid, totalDue, overallStatus, feesToShow, STATUS_STYLE, openEdit, openPay, handleWaive }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${pal.border}`}>
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-gray-50/60 transition-colors" onClick={() => setOpen(o => !o)}>
                <div className={`w-10 h-10 rounded-full ${pal.bg} ${pal.text} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {sg.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{sg.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sg.fees[0]?.studentId || ''} {sg.rollNumber ? `• Roll No. ${sg.rollNumber}` : ''}</p>
                </div>
                <div className="hidden sm:flex items-center gap-8 text-center">
                    <div><p className="text-xs text-gray-400">Total Fees</p><p className="text-sm font-semibold text-gray-700">₹{totalFees.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Paid Amount</p><p className="text-sm font-semibold text-green-600">₹{totalPaid.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Due Amount</p><p className="text-sm font-semibold text-red-500">₹{totalDue.toLocaleString()}</p></div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${OVERALL_STATUS_STYLE[overallStatus] || OVERALL_STATUS_STYLE.PENDING}`}>
                    {overallStatus}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {open && (
                <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Fee Type', 'Due Amount', 'Paid Amount', 'Balance', 'Due Date', 'Status', 'Receipt', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {feesToShow.map(fee => (
                                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{fee.feeType}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{fee.amount}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{fee.paidAmount || 0}</td>
                                    <td className="px-4 py-3 text-sm text-red-500 font-medium">₹{fee.remainingAmount || 0}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{fee.dueDate || '—'}</td>
                                    <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[fee.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {fee.status}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{fee.receiptNumber || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openEdit(fee)} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-violet-600 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            {fee.status !== 'PAID' && fee.status !== 'WAIVED' && (
                                                <button onClick={() => openPay(fee)} title="Record Payment" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {feesToShow[0]?.createdAt ? `Record Created: ${feesToShow[0].createdAt}` : `${feesToShow.length} fee record(s)`}
                    </div>
                </div>
            )}
        </div>
    );
}

const Fees = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();

    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const [fees, setFees]               = useState([]);
    const [students, setStudents]       = useState([]);
    const [classroom, setClassroom]     = useState(null);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [addModal, setAddModal]       = useState(false);
    const [editModal, setEditModal]     = useState(false);
    const [payModal, setPayModal]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [selectedFee, setSelectedFee] = useState(null);
    const [payAmount, setPayAmount]     = useState('');
    const [form, setForm]               = useState(EMPTY_FEE);
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => { loadData(); }, [classroomId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            const c  = cr.data.data;
            setClassroom(c);

            const [feesRes, studRes] = await Promise.all([
                schoolApi.getFeesByOrganization(orgId),
                c?.classroomName
                    ? schoolApi.getStudentsByClass(orgId, c.classroomName)
                    : schoolApi.getStudentsByOrganization(orgId),
            ]);
            const classStudents = studRes.data.data || [];
            const classroomStudentUserIds = new Set(classStudents.map(s => s.userId));
            const allFees = feesRes.data.data || [];
            setFees(allFees.filter(fee => classroomStudentUserIds.has(fee.studentId)));
            setStudents(classStudents.map(s => ({ id: s.userId, name: s.userFullName, rollNumber: s.rollNumber })));
        } catch { toast.error('Failed to fetch fee data'); }
        finally { setLoading(false); }
    };

    const openAdd = () => { setForm(EMPTY_FEE); setAddModal(true); };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.createFee({ ...form, amount: parseFloat(form.amount), studentId: parseInt(form.studentId), organizationId: parseInt(orgId) });
            toast.success('Fee record created successfully');
            setAddModal(false);
            loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create fee'); }
        finally { setSaving(false); }
    };

    const openEdit = (fee) => {
        setEditingId(fee.id);
        setForm({ feeType: fee.feeType || 'SCHOOL', amount: fee.amount || '', dueDate: fee.dueDate || '', description: fee.description || '', studentId: fee.studentId || '' });
        setEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.updateFee(editingId, { ...form, amount: parseFloat(form.amount), studentId: parseInt(form.studentId), organizationId: parseInt(orgId) });
            toast.success('Fee updated successfully');
            setEditModal(false);
            loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update fee'); }
        finally { setSaving(false); }
    };

    const openPay = (fee) => { setSelectedFee(fee); setPayAmount(''); setPayModal(true); };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        if (!payAmount || parseFloat(payAmount) <= 0) { toast.error('Enter a valid amount'); return; }
        setSaving(true);
        try {
            await schoolApi.payFee(selectedFee.id, parseFloat(payAmount));
            toast.success('Payment recorded successfully');
            setPayModal(false);
            loadData();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to record payment';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleWaive = async (feeId) => {
        if (!window.confirm('Are you sure you want to waive this fee?')) return;
        try {
            await schoolApi.waiveFee(feeId);
            toast.success('Fee waived successfully');
            loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to waive fee'); }
    };

    const label = classroom?.classroomName || `Classroom #${classroomId}`;

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/classrooms')} className="hover:text-violet-600">Classrooms</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{label}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Fee Collection — {label}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Student-wise fee records</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Fee
                    </button>
                </div>

                {/* Summary cards - unchanged */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Students', value: students.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-blue-50', color: 'text-blue-600', display: students.length },
                        { label: 'Total Collected', value: fees.reduce((s, f) => s + (f.paidAmount || 0), 0), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-50', color: 'text-green-600', display: `₹${fees.reduce((s, f) => s + (f.paidAmount || 0), 0).toLocaleString()}` },
                        { label: 'Total Due', value: fees.reduce((s, f) => s + (f.remainingAmount || 0), 0), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-50', color: 'text-amber-600', display: `₹${fees.reduce((s, f) => s + (f.remainingAmount || 0), 0).toLocaleString()}` },
                        { label: 'Total Receipts', value: fees.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-violet-50', color: 'text-violet-600', display: fees.length },
                    ].map(card => (
                        <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-800">{card.display}</p>
                                <p className="text-xs text-gray-400">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search by student name, roll no." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-full sm:w-40 text-gray-700 font-medium">
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="WAIVED">Waived</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-60"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : (() => {
                    const studentMap = {};
                    students.forEach(s => { studentMap[s.id] = { ...s, fees: [] }; });
                    fees.forEach(fee => { if (studentMap[fee.studentId]) studentMap[fee.studentId].fees.push(fee); });

                    const studentGroups = Object.values(studentMap).filter(sg => {
                        if (sg.fees.length === 0) return false;
                        const matchSearch = !search || sg.name?.toLowerCase().includes(search.toLowerCase()) ||
                            sg.fees.some(f => f.feeType?.toLowerCase().includes(search.toLowerCase()));
                        const matchStatus = statusFilter === 'ALL' || sg.fees.some(f => f.status === statusFilter);
                        return matchSearch && matchStatus;
                    });

                    if (studentGroups.length === 0) {
                        return (
                            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                <p className="text-sm font-medium text-gray-700">{fees.length === 0 ? 'No fee records' : 'No fees match filters'}</p>
                                {fees.length === 0 && <p className="text-xs text-gray-400 mt-1">Click "Add Fee" to create a fee record</p>}
                            </div>
                        );
                    }

                    const colors = [
                        { border: 'border-l-purple-400', bg: 'bg-purple-100', text: 'text-purple-700' },
                        { border: 'border-l-green-400',  bg: 'bg-green-100',  text: 'text-green-700'  },
                        { border: 'border-l-blue-400',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
                    ];

                    return (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400 mb-1">Showing {studentGroups.length} student{studentGroups.length !== 1 ? 's' : ''}</p>
                            {studentGroups.map((sg, idx) => {
                                const pal = colors[idx % colors.length];
                                const feesToShow  = statusFilter === 'ALL' ? sg.fees : sg.fees.filter(f => f.status === statusFilter);
                                const totalFees   = sg.fees.reduce((s, f) => s + (f.amount || 0), 0);
                                const totalPaid   = sg.fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
                                const totalDue    = sg.fees.reduce((s, f) => s + (f.remainingAmount || 0), 0);
                                const allPaid     = sg.fees.every(f => f.status === 'PAID' || f.status === 'WAIVED');
                                const hasOverdue  = sg.fees.some(f => f.status === 'OVERDUE');
                                const overallStatus = allPaid ? 'PAID' : hasOverdue ? 'OVERDUE' : 'PENDING';
                                return (
                                    <StudentFeeCard
                                        key={sg.id}
                                        sg={sg}
                                        pal={pal}
                                        totalFees={totalFees}
                                        totalPaid={totalPaid}
                                        totalDue={totalDue}
                                        overallStatus={overallStatus}
                                        feesToShow={feesToShow}
                                        STATUS_STYLE={STATUS_STYLE}
                                        openEdit={openEdit}
                                        openPay={openPay}
                                        handleWaive={handleWaive}
                                    />
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* Modals remain exactly same as original – no change */}
            <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Fee Record">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <F label="Student *">
                        <Select required value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}>
                            <option value="">-- Select Student --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </F>
                    <F label="Fee Type *">
                        <Select value={form.feeType} onChange={e => setForm({...form, feeType: e.target.value})}>
                            <option value="SCHOOL">School Fee</option>
                            <option value="EXAM">Exam Fee</option>
                            <option value="LIBRARY">Library Fee</option>
                            <option value="SPORTS">Sports Fee</option>
                            <option value="TRANSPORT">Transport Fee</option>
                            <option value="HOSTEL">Hostel Fee</option>
                            <option value="OTHER">Other</option>
                        </Select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Amount (₹) *"><Input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" /></F>
                        <F label="Due Date *"><Input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></F>
                    </div>
                    <F label="Description"><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setAddModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : 'Add Fee'}</button>
                    </div>
                </form>
            </Modal>

            <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Fee Record">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <F label="Student *">
                        <Select required value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}>
                            <option value="">-- Select Student --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </F>
                    <F label="Fee Type *">
                        <Select value={form.feeType} onChange={e => setForm({...form, feeType: e.target.value})}>
                            <option value="SCHOOL">School Fee</option>
                            <option value="EXAM">Exam Fee</option>
                            <option value="LIBRARY">Library Fee</option>
                            <option value="SPORTS">Sports Fee</option>
                            <option value="TRANSPORT">Transport Fee</option>
                            <option value="HOSTEL">Hostel Fee</option>
                            <option value="OTHER">Other</option>
                        </Select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Amount (₹) *"><Input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" /></F>
                        <F label="Due Date *"><Input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></F>
                    </div>
                    <F label="Description"><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setEditModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : 'Update Fee'}</button>
                    </div>
                </form>
            </Modal>

            <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment">
                <form onSubmit={handlePaySubmit} className="space-y-4">
                    {selectedFee && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-medium text-gray-800">{selectedFee.studentName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Fee Type</span><span className="font-medium text-gray-800">{selectedFee.feeType}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-800">₹{selectedFee.amount}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Already Paid</span><span className="font-medium text-green-600">₹{selectedFee.paidAmount || 0}</span></div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="text-gray-500">Remaining</span><span className="font-semibold text-red-500">₹{selectedFee.remainingAmount || selectedFee.amount}</span></div>
                        </div>
                    )}
                    <F label="Payment Amount (₹) *">
                        <Input required type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Enter amount being paid" />
                    </F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setPayModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};

export default Fees;