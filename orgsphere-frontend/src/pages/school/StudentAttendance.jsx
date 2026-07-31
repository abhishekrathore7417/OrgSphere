import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { userApi } from '../../api/userApi';
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
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    PRESENT:  'bg-green-50 text-green-700 border-green-100',
    ABSENT:   'bg-red-50 text-red-600 border-red-100',
    ON_LEAVE: 'bg-amber-50 text-amber-600 border-amber-100',
};

const StudentAttendance = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const today = new Date().toISOString().split('T')[0];
    const EMPTY = { attendanceDate: today, status: 'PRESENT', remarks: '', userId: '' };

    const [attendances, setAttendances] = useState([]);
    const [students, setStudents]       = useState([]);
    const [classroom, setClassroom]     = useState(null);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [modal, setModal]             = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [form, setForm]               = useState(EMPTY);

    useEffect(() => { loadData(); }, [classroomId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            const c = cr.data.data;
            setClassroom(c);
            // Fetch students of this specific classroom
            const stuRes = c?.classroomName
                ? await schoolApi.getStudentsByClass(orgId, c.classroomName)
                : await schoolApi.getStudentsByOrganization(orgId);
            const classStudents = stuRes.data.data || [];
            const studentUserIds = new Set(classStudents.map(s => s.userId));
            setStudents(classStudents.map(s => ({ id: s.userId, name: s.userFullName })));

            // Fetch ALL attendance then filter to only this classroom's students
            const { companyApi } = await import('../../api/companyApi');
            const res = await companyApi.getAttendanceByOrganization(orgId);
            const allAtt = res.data.data || [];
            // Keep only records for students in this classroom
            setAttendances(allAtt.filter(a => studentUserIds.has(a.userId)));
        } catch { toast.error('Failed to load attendance'); }
        finally { setLoading(false); }
    };

    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (a) => {
        setEditingId(a.id);
        setForm({ attendanceDate: a.attendanceDate || today, status: a.status, remarks: a.remarks || '', userId: a.userId || '' });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { companyApi } = await import('../../api/companyApi');
            const payload = { ...form, userId: parseInt(form.userId), organizationId: parseInt(orgId) };
            if (editingId) {
                await companyApi.updateAttendance(editingId, payload);
                toast.success('Attendance updated');
            } else {
                await companyApi.markAttendance(payload);
                toast.success('Attendance marked');
            }
            setModal(false); loadData();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
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
                    <div><h2 className="text-lg font-semibold text-gray-800">Student Attendance — {label}</h2><p className="text-sm text-gray-400 mt-0.5">Mark and track student daily attendance</p></div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Mark Attendance
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : attendances.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-sm font-medium text-gray-700">No attendance records</p><p className="text-xs text-gray-400 mt-1">Click "Mark Attendance" to get started</p></div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">{['Student','Date','Status','Remarks','Action'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {attendances.map(a=>(
                                    <tr key={a.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{a.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{a.attendanceDate}</td>
                                        <td className="px-4 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[a.status]||'bg-gray-50 text-gray-500 border-gray-100'}`}>{a.status}</span></td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{a.remarks||'—'}</td>
                                        <td className="px-4 py-3.5"><button onClick={()=>openEdit(a)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal open={modal} onClose={()=>setModal(false)} title={editingId?'Edit Attendance':'Mark Attendance'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <F label="Select Student *"><Select required value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}><option value="">-- Select student --</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</Select></F>
                    <F label="Date *"><Input required type="date" value={form.attendanceDate} onChange={e=>setForm({...form,attendanceDate:e.target.value})} /></F>
                    <F label="Status *"><Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="ON_LEAVE">On Leave</option></Select></F>
                    <F label="Remarks"><Input value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} placeholder="Optional" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={()=>setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving?'Saving...':editingId?'Update':'Mark'}</button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};
export default StudentAttendance;
