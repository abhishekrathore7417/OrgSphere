import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { companyApi } from '../../api/companyApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const buildNav = (id) => [
    { path: '/school/dashboard',  label: 'Dashboard',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/classrooms', label: 'Classrooms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/school/classrooms/${id}/students`,   label: 'Students',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /></svg> },
    { path: `/school/classrooms/${id}/attendance`, label: 'Attendance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { path: `/school/classrooms/${id}/fees`,       label: 'Fees',       icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { path: `/school/classrooms/${id}/leaves`,     label: 'Leaves',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input    = (props) => <input    {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select   = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;
const Textarea = (props) => <textarea {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />;

const STATUS_STYLE = { PENDING:'bg-amber-50 text-amber-600 border-amber-100', APPROVED:'bg-green-50 text-green-700 border-green-100', REJECTED:'bg-red-50 text-red-600 border-red-100' };
const EMPTY = { leaveType: 'SICK', startDate: '', endDate: '', reason: '' };

const StudentLeaves = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const userId   = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;

    const [leaves, setLeaves]       = useState([]);
    const [students, setStudents]   = useState([]);
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [modal, setModal]         = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [form, setForm]           = useState(EMPTY);

    useEffect(() => { loadData(); }, [classroomId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            const c = cr.data.data;
            setClassroom(c);
            // Fetch students of this classroom
            const stuRes = c?.classroomName
                ? await schoolApi.getStudentsByClass(orgId, c.classroomName)
                : await schoolApi.getStudentsByOrganization(orgId);
            const classStudents = (stuRes.data.data || []).filter(s => s.status === 'ACTIVE');
            const studentUserIds = new Set(classStudents.map(s => s.userId));
            setStudents(classStudents.map(s => ({ id: s.userId, name: s.userFullName })));
            // Fetch all leaves then filter to this classroom's students only
            const res = await companyApi.getLeavesByOrganization(orgId);
            const allLeaves = res.data.data || [];
            setLeaves(allLeaves.filter(l => studentUserIds.has(l.userId)));
        } catch { toast.error('Failed to load leaves'); }
        finally { setLoading(false); }
    };

    const set = (k, v) => setForm(f => ({...f, [k]: v}));
    const openAdd = () => { setEditingId(null); setForm(EMPTY); setSelectedUserId(''); setModal(true); };
    const openEdit = (l) => { setEditingId(l.id); setSelectedUserId(l.userId || ''); setForm({ leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, reason: l.reason||'' }); setModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        const applyUserId = parseInt(selectedUserId) || parseInt(userId);
        try {
            if (editingId) { await companyApi.updateLeave(editingId, { ...form, userId: applyUserId, organizationId: parseInt(orgId) }); toast.success('Leave updated'); }
            else { await companyApi.applyLeave({ ...form, userId: applyUserId, organizationId: parseInt(orgId) }); toast.success('Leave applied'); }
            setModal(false); loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const approve = async (id) => { try { await companyApi.approveLeave(id); toast.success('Approved'); loadData(); } catch { toast.error('Failed'); } };
    const reject  = async (id) => { try { await companyApi.rejectLeave(id);  toast.success('Rejected'); loadData(); } catch { toast.error('Failed'); } };
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
                    <div><h2 className="text-lg font-semibold text-gray-800">Student Leaves — {label}</h2><p className="text-sm text-gray-400 mt-0.5">Manage student leave requests</p></div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Apply Leave
                    </button>
                </div>
                {loading ? <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                : leaves.length === 0 ? <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-sm font-medium text-gray-700">No leave requests</p></div>
                : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">{['Student','Type','From','To','Reason','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {leaves.map(l=>(
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{l.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{l.leaveType}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{l.startDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{l.endDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500 max-w-32 truncate">{l.reason||'—'}</td>
                                        <td className="px-4 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[l.status]||'bg-gray-50 text-gray-500 border-gray-100'}`}>{l.status}</span></td>
                                        <td className="px-4 py-3.5"><div className="flex items-center gap-2">
                                            <button onClick={()=>openEdit(l)} title="Edit" className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            {l.status==='PENDING' && <><button onClick={()=>approve(l.id)} className="text-xs text-green-600 font-medium">Approve</button><button onClick={()=>reject(l.id)} className="text-xs text-red-500 font-medium">Reject</button></>}
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal open={modal} onClose={()=>setModal(false)} title={editingId?'Edit Leave':'Apply Leave'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <F label="Select Student *"><Select required value={selectedUserId} onChange={e=>setSelectedUserId(e.target.value)}><option value="">-- Select student --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</Select></F>
                    <F label="Leave Type *"><Select value={form.leaveType} onChange={e=>set('leaveType',e.target.value)}><option value="SICK">Sick Leave</option><option value="CASUAL">Casual Leave</option><option value="ANNUAL">Annual Leave</option><option value="UNPAID">Unpaid Leave</option></Select></F>
                    <div className="grid grid-cols-2 gap-3"><F label="Start Date *"><Input required type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} /></F><F label="End Date *"><Input required type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} /></F></div>
                    <F label="Reason"><Textarea rows={3} value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="Reason (optional)" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={()=>setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving?'Saving...':editingId?'Update':'Apply'}</button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};
export default StudentLeaves;
