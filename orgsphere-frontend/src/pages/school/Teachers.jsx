import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const buildNav = (deptName) => [
    { path: '/school/dashboard',   label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/departments', label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/school/departments/${deptName}/teachers`,   label: 'Teachers',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { path: `/school/departments/${deptName}/attendance`, label: 'Attendance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { path: `/school/departments/${deptName}/leaves`,     label: 'Leaves',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { path: `/school/departments/${deptName}/salary`,     label: 'Salary',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = { ACTIVE:'bg-green-50 text-green-700 border-green-100', ON_LEAVE:'bg-amber-50 text-amber-600 border-amber-100', TERMINATED:'bg-red-50 text-red-600 border-red-100' };
const EMPTY = { fullName:'', email:'', contactNumber:'', teacherId:'', specialization:'', qualification:'', experienceYears:'', joiningDate:'', status:'ACTIVE' };

const Teachers = () => {
    const { deptName } = useParams();
    const decoded = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [modal, setModal]       = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm]         = useState(EMPTY);

    useEffect(() => { load(); }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await schoolApi.getTeachersByOrganization(orgId);
            const all = res.data.data || [];
            // Filter teachers by department using localStorage mapping
            const deptKey = `dept_teachers_${orgId}_${decoded}`;
            const storedIds = JSON.parse(localStorage.getItem(deptKey) || '[]');
            // If no mapping yet show all (first time), else filter
            const filtered = storedIds.length > 0
                ? all.filter(t => storedIds.includes(t.id))
                : [];
            setTeachers(filtered);
        } catch { toast.error('Failed to fetch teachers'); }
        finally { setLoading(false); }
    };

    const set = (k, v) => setForm(f => ({...f, [k]: v}));
    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (t) => { setEditingId(t.id); setForm({ fullName: t.userFullName||'', email: t.userEmail||'', contactNumber:'', teacherId: t.teacherId||'', specialization: t.specialization||'', qualification: t.qualification||'', experienceYears: t.experienceYears||'', joiningDate: t.joiningDate||'', status: t.status||'ACTIVE' }); setModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editingId) {
                await schoolApi.updateTeacher(editingId, { teacherId: form.teacherId, specialization: form.specialization, qualification: form.qualification, experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null, joiningDate: form.joiningDate, status: form.status, organizationId: parseInt(orgId) });
                toast.success('Teacher updated');
            } else {
                const uRes = await userApi.createUser({ fullName: form.fullName, email: form.email, contactNumber: form.contactNumber, role: 'TEACHER', organizationId: parseInt(orgId) });
                const uid = uRes.data.data?.id;
                const teacherRes = await schoolApi.createTeacher({ teacherId: form.teacherId, specialization: form.specialization, qualification: form.qualification, experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null, joiningDate: form.joiningDate, status: form.status, userId: uid, organizationId: parseInt(orgId) });
                // Store teacher-department mapping in localStorage
                const newTeacherId = teacherRes.data.data?.id;
                if (newTeacherId) {
                    const deptKey = `dept_teachers_${orgId}_${decoded}`;
                    const existing = JSON.parse(localStorage.getItem(deptKey) || '[]');
                    localStorage.setItem(deptKey, JSON.stringify([...existing, newTeacherId]));
                }
                toast.success('Teacher added');
            }
            setModal(false); load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/departments')} className="hover:text-violet-600">Departments</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div><h2 className="text-lg font-semibold text-gray-800">Teachers — {decoded}</h2><p className="text-sm text-gray-400 mt-0.5">Manage teacher profiles</p></div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Teacher
                    </button>
                </div>
                {loading ? <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                : teachers.length === 0 ? <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-sm font-medium text-gray-700">No teachers yet</p><p className="text-xs text-gray-400 mt-1">Click "Add Teacher" to get started</p></div>
                : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">{['Teacher ID','Name','Email','Specialization','Qualification','Experience','Status','Action'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {teachers.map(t=>(
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{t.teacherId}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-700">{t.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.userEmail}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.specialization}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.qualification}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.experienceYears ? `${t.experienceYears} yrs` : '—'}</td>
                                        <td className="px-4 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[t.status]||'bg-gray-50 text-gray-500 border-gray-100'}`}>{t.status}</span></td>
                                        <td className="px-4 py-3.5"><button onClick={()=>openEdit(t)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal open={modal} onClose={()=>setModal(false)} title={editingId?'Edit Teacher':'Add Teacher'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!editingId && (<><F label="Full Name *"><Input required value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="e.g. Priya Sharma" /></F><div className="grid grid-cols-2 gap-3"><F label="Email *"><Input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="teacher@email.com" /></F><F label="Contact *"><Input required value={form.contactNumber} onChange={e=>set('contactNumber',e.target.value)} placeholder="Mobile number" /></F></div></>)}
                    <F label="Teacher ID *"><Input required value={form.teacherId} onChange={e=>set('teacherId',e.target.value)} placeholder="e.g. TCH001" /></F>
                    <F label="Specialization *"><Input required value={form.specialization} onChange={e=>set('specialization',e.target.value)} placeholder="e.g. Mathematics" /></F>
                    <F label="Qualification *"><Input required value={form.qualification} onChange={e=>set('qualification',e.target.value)} placeholder="e.g. B.Ed" /></F>
                    <div className="grid grid-cols-2 gap-3"><F label="Joining Date *"><Input required type="date" value={form.joiningDate} onChange={e=>set('joiningDate',e.target.value)} /></F><F label="Experience (Yrs)"><Input type="number" value={form.experienceYears} onChange={e=>set('experienceYears',e.target.value)} placeholder="5" /></F></div>
                    <F label="Status"><Select value={form.status} onChange={e=>set('status',e.target.value)}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On Leave</option><option value="TERMINATED">Terminated</option></Select></F>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={()=>setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving?'Saving...':editingId?'Update':'Add Teacher'}</button></div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};
export default Teachers;
