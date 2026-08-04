import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const buildNav = (classroomId) => [
    { path: '/school/dashboard',  label: 'Dashboard',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/classrooms', label: 'Classrooms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/school/classrooms/${classroomId}/students`,   label: 'Students',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
    { path: `/school/classrooms/${classroomId}/attendance`, label: 'Attendance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { path: `/school/classrooms/${classroomId}/fees`,       label: 'Fees',       icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { path: `/school/classrooms/${classroomId}/leaves`,     label: 'Leaves',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    PAID:    'bg-green-50 text-green-700 border-green-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    OVERDUE: 'bg-red-50 text-red-600 border-red-100',
    PARTIAL: 'bg-violet-50 text-violet-600 border-violet-100',
    WAIVED:  'bg-gray-50 text-gray-500 border-gray-100',
};

const EMPTY_FEE = { feeType: 'TUITION', amount: '', dueDate: '', description: '', studentId: '' };

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
            // Filter fees — only show fees for students in THIS classroom
            const classroomStudentUserIds = new Set(classStudents.map(s => s.userId));
            const allFees = feesRes.data.data || [];
            setFees(allFees.filter(fee => classroomStudentUserIds.has(fee.studentId)));
            setStudents(classStudents.map(s => ({ id: s.userId, name: s.userFullName })));
        } catch { toast.error('Failed to fetch fee data'); }
        finally { setLoading(false); }
    };

    // ── Add Fee ──────────────────────────────────────────────
    const openAdd = () => { setForm(EMPTY_FEE); setAddModal(true); };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.createFee({
                ...form,
                amount:         parseFloat(form.amount),
                studentId:      parseInt(form.studentId),
                organizationId: parseInt(orgId),
            });
            toast.success('Fee record created successfully');
            setAddModal(false);
            loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create fee'); }
        finally { setSaving(false); }
    };

    // ── Edit Fee ─────────────────────────────────────────────
    const openEdit = (fee) => {
        setEditingId(fee.id);
        setForm({
            feeType:     fee.feeType     || 'TUITION',
            amount:      fee.amount      || '',
            dueDate:     fee.dueDate     || '',
            description: fee.description || '',
            studentId:   fee.studentId   || '',
        });
        setEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.updateFee(editingId, {
                ...form,
                amount:         parseFloat(form.amount),
                studentId:      parseInt(form.studentId),
                organizationId: parseInt(orgId),
            });
            toast.success('Fee updated successfully');
            setEditModal(false);
            loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update fee'); }
        finally { setSaving(false); }
    };

    // ── Pay Fee ──────────────────────────────────────────────
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
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to record payment'); }
        finally { setSaving(false); }
    };

    const label = classroom?.classroomName || `Classroom #${classroomId}`;

    // ── FeeForm JSX inline (no inner component — avoids re-mount & focus loss) ──

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
                        <h2 className="text-lg font-semibold text-gray-800">Fee Management — {label}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Track and manage student fee records</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Fee
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-60"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : fees.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No fee records</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Fee" to create a fee record</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                {['Student','Fee Type','Amount','Paid','Remaining','Due Date','Status','Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {fees.map(fee => (
                                    <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{fee.studentName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{fee.feeType}</td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">₹{fee.amount}</td>
                                        <td className="px-4 py-3.5 text-sm text-green-600 font-medium">₹{fee.paidAmount || 0}</td>
                                        <td className="px-4 py-3.5 text-sm text-red-500 font-medium">₹{fee.remainingAmount || fee.amount}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{fee.dueDate}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[fee.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{fee.status}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(fee)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button>
                                                {fee.status !== 'PAID' && fee.status !== 'WAIVED' && (
                                                    <button onClick={() => openPay(fee)} className="text-xs text-green-600 hover:text-green-800 font-medium">Pay</button>
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

            {/* Add Fee Modal */}
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
                            <option value="TUITION">Tuition Fee</option>
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

            {/* Edit Fee Modal */}
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
                            <option value="TUITION">Tuition Fee</option>
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

            {/* Pay Fee Modal */}
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
