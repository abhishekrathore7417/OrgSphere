import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const NAV = [
    { path: '/school/dashboard',  label: 'Dashboard',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/classrooms', label: 'Classrooms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    ACTIVE:            'bg-green-50 text-green-700 border-green-100',
    INACTIVE:          'bg-gray-50 text-gray-500 border-gray-100',
    UNDER_MAINTENANCE: 'bg-amber-50 text-amber-600 border-amber-100',
};

const EMPTY = { classroomName: '', classCode: '', section: '', capacity: '', status: 'ACTIVE', teacherId: '' };

const Classrooms = () => {
    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);
    const [modal, setModal]           = useState(false);
    const [editingId, setEditingId]   = useState(null);
    const [form, setForm]             = useState(EMPTY);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await schoolApi.getClassroomsByOrganization(orgId);
            setClassrooms(res.data.data || []);
        } catch { toast.error('Failed to fetch classrooms'); }
        finally { setLoading(false); }
    };

    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (c) => {
        setEditingId(c.id);
        setForm({
            classroomName: c.classroomName || '',
            classCode:     c.classCode     || '',
            section:       c.section       || '',
            capacity:      c.capacity      || '',
            status:        c.status        || 'ACTIVE',
            teacherId:     '',
        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            classroomName:  form.classroomName,
            classCode:      form.classCode,
            section:        form.section,
            capacity:       form.capacity ? parseInt(form.capacity) : null,
            status:         form.status,
            classTeacherId: form.teacherId ? parseInt(form.teacherId) : null,
            organizationId: parseInt(orgId),
        };
        try {
            if (editingId) {
                await schoolApi.updateClassroom(editingId, payload);
                toast.success('Classroom updated successfully');
            } else {
                await schoolApi.createClassroom(payload);
                toast.success('Classroom created successfully');
            }
            setModal(false);
            load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save classroom'); }
        finally { setSaving(false); }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Classrooms</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Select a classroom to manage its students, teachers and fees</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Classroom
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-60"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : classrooms.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">No classrooms yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Classroom" to create one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classrooms.map((c) => (
                            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[c.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{c.status}</span>
                                        <button onClick={() => openEdit(c)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-800 text-sm">{c.classroomName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Code: {c.classCode}</p>
                                <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-1 text-xs text-gray-500">
                                    <span>Section: <span className="font-medium text-gray-700">{c.section || '—'}</span></span>
                                    <span>Capacity: <span className="font-medium text-gray-700">{c.capacity || '—'}</span></span>
                                    <span className="col-span-2">Teacher: <span className="font-medium text-gray-700">{c.classTeacher || 'Not assigned'}</span></span>
                                </div>
                                <button
                                    onClick={() => navigate(`/school/classrooms/${c.id}/students`)}
                                    className="mt-4 w-full text-xs text-center bg-violet-50 hover:bg-violet-100 text-violet-700 font-medium py-1.5 rounded-lg transition-colors"
                                >
                                    View Classroom
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Classroom' : 'Add Classroom'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Classroom Name *"><Input required value={form.classroomName} onChange={e => setForm({...form, classroomName: e.target.value})} placeholder="e.g. Class 10A" /></F>
                        <F label="Class Code *"><Input required value={form.classCode} onChange={e => setForm({...form, classCode: e.target.value})} placeholder="e.g. CLS-10A" /></F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Section"><Input value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="e.g. A" /></F>
                        <F label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} placeholder="e.g. 40" /></F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Teacher ID (optional)"><Input type="number" value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})} placeholder="Assign teacher" /></F>
                        <F label="Status">
                            <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                            </Select>
                        </F>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Classroom'}
                        </button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};

export default Classrooms;
