import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const buildNav = (classroomId) => [
    { path: '/school/dashboard',  label: 'Dashboard',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/classrooms', label: 'Classrooms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/school/classrooms/${classroomId}/students`, label: 'Students', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
    { path: `/school/classrooms/${classroomId}/teachers`, label: 'Teachers', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { path: `/school/classrooms/${classroomId}/fees`,     label: 'Fees',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;

const EMPTY = { fullName: '', email: '', contactNumber: '', studentId: '', admissionDate: '', className: '', section: '', rollNumber: '', guardianName: '', guardianContact: '' };

const Students = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();

    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const [students, setStudents]   = useState([]);
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [modal, setModal]         = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm]           = useState(EMPTY);

    useEffect(() => { loadClassroom(); }, [classroomId]);

    const loadClassroom = async () => {
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            const c = cr.data.data;
            setClassroom(c);
            // Fetch students by class name
            const res = c?.classroomName
                ? await schoolApi.getStudentsByClass(orgId, c.classroomName)
                : await schoolApi.getStudentsByOrganization(orgId);
            setStudents(res.data.data || []);
        } catch { toast.error('Failed to fetch students'); }
        finally { setLoading(false); }
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const openAdd = () => {
        setEditingId(null);
        setForm({ ...EMPTY, className: classroom?.classroomName || '', section: classroom?.section || '' });
        setModal(true);
    };

    const openEdit = (s) => {
        setEditingId(s.id);
        setForm({
            fullName: s.userFullName || '', email: s.userEmail || '', contactNumber: '',
            studentId: s.studentId || '', admissionDate: s.admissionDate || '',
            className: s.className || '', section: s.section || '',
            rollNumber: s.rollNumber || '', guardianName: s.guardianName || '',
            guardianContact: s.guardianContact || '',
        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await schoolApi.updateStudent(editingId, {
                    studentId: form.studentId, admissionDate: form.admissionDate,
                    className: form.className, section: form.section,
                    rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
                    guardianName: form.guardianName, guardianContact: form.guardianContact,
                    status: 'ACTIVE', organizationId: parseInt(orgId),
                });
                toast.success('Student updated successfully');
            } else {
                const uRes = await userApi.createUser({
                    fullName: form.fullName, email: form.email,
                    contactNumber: form.contactNumber,
                    role: 'STUDENT', organizationId: parseInt(orgId),
                });
                const uid = uRes.data.data?.id;
                await schoolApi.createStudent({
                    studentId: form.studentId, admissionDate: form.admissionDate,
                    className: form.className, section: form.section,
                    rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
                    guardianName: form.guardianName, guardianContact: form.guardianContact,
                    status: 'ACTIVE', userId: uid, organizationId: parseInt(orgId),
                });
                toast.success('Student enrolled successfully');
            }
            setModal(false);
            loadClassroom();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save student'); }
        finally { setSaving(false); }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/classrooms')} className="hover:text-violet-600">Classrooms</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{classroom?.classroomName || `Classroom #${classroomId}`}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Students — {classroom?.classroomName || `Classroom #${classroomId}`}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Manage student enrollment and records</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Student
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : students.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No students enrolled</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Student" to enroll your first student</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                {['Student ID','Name','Email','Class','Section','Roll No','Guardian','Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{s.studentId}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-700">{s.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.userEmail}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.className}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.section || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.rollNumber || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.guardianName || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => openEdit(s)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Student' : 'Add Student'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!editingId && (
                        <>
                            <F label="Full Name *"><Input required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Arjun Singh" /></F>
                            <div className="grid grid-cols-2 gap-3">
                                <F label="Email *"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@email.com" /></F>
                                <F label="Contact Number *"><Input required value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} placeholder="Mobile number" /></F>
                            </div>
                        </>
                    )}
                    <F label="Student ID *"><Input required value={form.studentId} onChange={e => set('studentId', e.target.value)} placeholder="e.g. STU001" /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Class *"><Input required value={form.className} onChange={e => set('className', e.target.value)} placeholder="e.g. 10" /></F>
                        <F label="Section"><Input value={form.section} onChange={e => set('section', e.target.value)} placeholder="e.g. A" /></F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Admission Date *"><Input required type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} /></F>
                        <F label="Roll Number"><Input type="number" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} placeholder="Roll no." /></F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Guardian Name"><Input value={form.guardianName} onChange={e => set('guardianName', e.target.value)} placeholder="Parent/Guardian name" /></F>
                        <F label="Guardian Contact"><Input value={form.guardianContact} onChange={e => set('guardianContact', e.target.value)} placeholder="Contact number" /></F>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};

export default Students;
