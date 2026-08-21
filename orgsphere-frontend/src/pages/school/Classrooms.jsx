import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
);
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => (
    <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>
);

const EMPTY = {
    classroomName: '', section: '', session: '',
    capacity: '', status: 'ACTIVE', classTeacherId: '', classTeacher: '',
};

const Classrooms = () => {
    const { user, organizationId: reduxOrgId } = useSelector((s) => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [teachers,   setTeachers]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [modal,      setModal]      = useState(false);
    const [editingId,  setEditingId]  = useState(null);
    const [form,       setForm]       = useState(EMPTY);
    const [search,     setSearch]     = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [academicYear, setAcademicYear] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [cRes, tRes, yRes] = await Promise.all([
                schoolApi.getClassroomsByOrganization(orgId),
                schoolApi.getTeachersByOrganization(orgId),
                schoolApi.getCurrentAcademicYear(orgId)
            ]);
            setClassrooms(cRes.data.data || []);
            setTeachers(tRes.data.data || []);
            setAcademicYear(yRes.data.data);
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (c) => {
        setEditingId(c.id);
        setForm({
            classroomName:  c.classroomName  || '',
            section:        c.section        || '',
            session:        c.session        || '',   // ← fix: session properly populated
            capacity:       c.capacity       || '',
            status:         c.status         || 'ACTIVE',
            classTeacherId: c.classTeacherId || '',
            classTeacher:   c.classTeacher   || '',
        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            classroomName:  form.classroomName,
            section:        form.section,
            session:        form.session,
            capacity:       form.capacity ? parseInt(form.capacity) : null,
            status:         form.status,
            classTeacherId: form.classTeacherId ? parseInt(form.classTeacherId) : null,
            classTeacher:   form.classTeacherId
                ? teachers.find(t => t.id === parseInt(form.classTeacherId))?.userFullName || null
                : null,
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
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save classroom');
        } finally { setSaving(false); }
    };

    /* ── Soft delete: INACTIVE karne par students/fees/leaves bhi INACTIVE ── */
    const toggleStatus = async (c) => {
        const newStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            // 1. Classroom status update
            await schoolApi.updateClassroom(c.id, { ...c, status: newStatus, organizationId: parseInt(orgId) });

            // 2. Agar INACTIVE kar rahe hain to us classroom ke saare students bhi INACTIVE
            if (newStatus === 'INACTIVE') {
                const stuRes = await schoolApi.getStudentsByOrganization(orgId);
                const allStudents = stuRes.data.data || [];
                // classroomId match karne wale students
                const clsStudents = allStudents.filter(s =>
                    s.classroomId === c.id ||
                    s.className === c.classroomName
                );
                await Promise.allSettled(
                    clsStudents.map(s =>
                        schoolApi.updateStudent(s.id, {
                            ...s,
                            status: 'INACTIVE',
                            organizationId: parseInt(orgId),
                        })
                    )
                );
                toast.success(`Classroom marked INACTIVE — ${clsStudents.length} student(s) also deactivated`);
            } else {
                // ACTIVE karne par students wapas ACTIVE
                const stuRes = await schoolApi.getStudentsByOrganization(orgId);
                const allStudents = stuRes.data.data || [];
                const clsStudents = allStudents.filter(s =>
                    s.classroomId === c.id ||
                    s.className === c.classroomName
                );
                await Promise.allSettled(
                    clsStudents.map(s =>
                        schoolApi.updateStudent(s.id, {
                            ...s,
                            status: 'ACTIVE',
                            organizationId: parseInt(orgId),
                        })
                    )
                );
                toast.success(`Classroom marked ACTIVE — ${clsStudents.length} student(s) also reactivated`);
            }
            load();
        } catch { toast.error('Failed to update status'); }
    };

    const filtered = classrooms.filter(c => {
        const matchSearch = !search ||
            c.classroomName?.toLowerCase().includes(search.toLowerCase()) ||
            c.classCode?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-blue-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <button onClick={() => navigate('/school/classrooms')} className="hover:text-blue-600">Classrooms</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Classrooms</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Classrooms</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage classrooms, class teachers and capacity</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{classrooms.length}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{classrooms.filter(c=>c.status==='ACTIVE').length}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{classrooms.filter(c=>c.status==='INACTIVE').length}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Inactive</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Academic Year</p>
                                <p className="text-lg font-semibold text-gray-800">{academicYear ? academicYear.name : '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards Replaced By Header Section */}

                {/* Search + Filter + Add */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search classrooms by name or section..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-gray-700 font-medium">
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <button onClick={openAdd} title="Add Classroom"
                            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="flex items-center justify-center h-60">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                        <p className="text-sm font-medium text-gray-600">No classrooms found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or add a new classroom.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(c => {
                            /* Short initials like "10A" from "Class-10A" */
                            const initials = (c.classroomName || 'C')
                                .replace(/^class[-\s]*/i, '')
                                .slice(0, 4)
                                .toUpperCase();
                            const palettes = [
                                { bg: 'bg-violet-100', text: 'text-violet-700' },
                                { bg: 'bg-blue-100',   text: 'text-blue-700'   },
                                { bg: 'bg-green-100',  text: 'text-green-700'  },
                                { bg: 'bg-amber-100',  text: 'text-amber-700'  },
                                { bg: 'bg-rose-100',   text: 'text-rose-700'   },
                                { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
                            ];
                            const pal = palettes[(c.classroomName?.charCodeAt(0) || 0) % palettes.length];

                            return (
                                <div key={c.id}
                                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all flex flex-col hover:shadow-md ${
                                        c.status === 'INACTIVE' ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-blue-400'
                                    }`}>
                                    <div className="p-4 flex-1">
                                        {/* Top: avatar + name + status dot + View button — same as screenshot */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-medium text-lg shrink-0 ${pal.bg} ${pal.text}`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-800">{c.classroomName}</h3>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}/>
                                                    <span className={`text-[11px] ${c.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); navigate(`/school/classrooms/${c.id}/students`); }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                View
                                            </button>
                                        </div>

                                        <div className="space-y-2 px-1 mb-2">
                                            {[
                                                { label: 'Section',      val: c.section      || '—' },
                                                { label: 'Session',      val: c.session      || '—' },
                                                { label: 'Class Teacher',val: c.classTeacher || '—' },
                                                { label: 'Capacity',     val: c.capacity     || '—' },
                                                { label: 'Created On',   val: c.createdAt
                                                        ? new Date(c.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
                                                        : '—' },
                                            ].map(row => (
                                                <div key={row.label} className="flex items-center text-[13px] text-gray-700">
                                                    <span className="w-24 text-gray-500 text-xs font-medium shrink-0">{row.label}:</span>
                                                    <span className="truncate flex-1 text-gray-800 font-medium">{row.val}</span>
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                    {/* Bottom: Edit + Inactive buttons — same as screenshot */}
                                    <div className="p-3 border-t border-gray-100 flex gap-2">
                                        <button
                                            onClick={e => { e.stopPropagation(); openEdit(c); }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors bg-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={async e => { e.stopPropagation(); await toggleStatus(c); }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-colors bg-white ${
                                                c.status === 'ACTIVE'
                                                    ? 'border-red-200 text-red-500 hover:bg-red-50'
                                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                            }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>
                                            {c.status === 'ACTIVE' ? 'Inactive' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Classroom' : 'Add Classroom'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <F label="Classroom Name *">
                        <Input required value={form.classroomName}
                               onChange={e => setForm({...form, classroomName: e.target.value})}
                               placeholder="e.g. Class-10A" />
                    </F>

                    <div className="grid grid-cols-3 gap-3">
                        <F label="Section">
                            <Input value={form.section}
                                   onChange={e => setForm({...form, section: e.target.value})}
                                   placeholder="e.g. A" />
                        </F>
                        <F label={`Session${editingId ? ' (locked)' : ''}`}>
                            <input
                                value={form.session}
                                readOnly={!!editingId}
                                onChange={editingId ? undefined : e => setForm({...form, session: e.target.value})}
                                placeholder="e.g. 2026-27"
                                style={{ cursor: editingId ? 'not-allowed' : 'text' }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                            />
                        </F>


                        <F label="Capacity">
                            <Input type="number" value={form.capacity}
                                onChange={e => setForm({...form, capacity: e.target.value})}
                                placeholder="Max students" />
                        </F>
                    </div>
                    <F label="Class Teacher">
                        <Select value={form.classTeacherId}
                            onChange={e => setForm({...form, classTeacherId: e.target.value})}>
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.userFullName} ({t.teacherId})</option>
                            ))}
                        </Select>
                    </F>
                    {editingId && (
                        <F label="Status">
                            <Select value={form.status}
                                onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                            </Select>
                        </F>
                    )}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={() => setModal(false)}
                            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update Classroom' : 'Add Classroom'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Classrooms;
