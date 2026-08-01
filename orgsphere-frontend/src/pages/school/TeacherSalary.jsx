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
const EMPTY = { teacherId: '', monthlySalary: '', effectiveDate: '', notes: '' };

const TeacherSalary = () => {
    const { deptName } = useParams();
    const decoded = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [salaryTeachers, setSalaryTeachers] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modal, setModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Helper to get department teacher IDs from localStorage
    const getDeptTeacherIds = () => {
        const key = `dept_teachers_${orgId}_${decoded}`;
        const stored = localStorage.getItem(key);
        if (!stored) return [];
        try { return JSON.parse(stored); } catch { return []; }
    };

    // Helper to get/set salary from localStorage (since backend Teacher has no salary field)
    const getSavedSalary = (teacherId) => {
        const val = localStorage.getItem(`teacher_salary_${orgId}_${teacherId}`);
        return val ? parseFloat(val) : null;
    };
    const saveSalary = (teacherId, amount) => {
        localStorage.setItem(`teacher_salary_${orgId}_${teacherId}`, String(amount));
    };
    const deleteSalaryLocal = (teacherId) => {
        localStorage.removeItem(`teacher_salary_${orgId}_${teacherId}`);
    };

    useEffect(() => {
        load();
    }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await schoolApi.getTeachersByOrganization(orgId);
            const all = res.data.data || [];
            setAllTeachers(all);

            const deptIds = getDeptTeacherIds();
            let deptTeachers = deptIds.length > 0
                ? all.filter(t => deptIds.includes(t.id))
                : all;

            // Read salary from localStorage since backend Teacher entity has no monthlySalary field
            const enriched = deptTeachers.map(t => ({
                ...t,
                monthlySalary: getSavedSalary(t.id),
            }));

            // Show ALL dept teachers (with or without salary)
            setSalaryTeachers(enriched);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    // ===== Open Add Modal =====
    const openAdd = () => {
        const deptIds = getDeptTeacherIds();
        const deptTeachers = deptIds.length > 0
            ? allTeachers.filter(t => deptIds.includes(t.id))
            : allTeachers;
        if (deptTeachers.length === 0) {
            toast.info('No teachers in this department yet. Add teachers first.');
            return;
        }
        setModalMode('add');
        setEditingTeacher(null);
        setForm({ teacherId: '', monthlySalary: '', effectiveDate: '', notes: '' });
        setModal(true);
    };

    const openEdit = (teacher) => {
        setModalMode('edit');
        setEditingTeacher(teacher);
        setForm({
            teacherId: teacher.id,
            monthlySalary: teacher.monthlySalary || '',
            effectiveDate: '',
            notes: ''
        });
        setModal(true);
        setOpenMenuId(null);
    };

    const deleteSalary = async (teacher) => {
        if (!window.confirm(`Remove salary for ${teacher.userFullName}?`)) return;
        // Remove from localStorage
        deleteSalaryLocal(teacher.id);
        toast.success('Salary removed');
        load();
        setOpenMenuId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const targetId = form.teacherId || editingTeacher?.id;
        if (!targetId) { toast.error('Please select a teacher'); return; }
        setSaving(true);
        try {
            const salaryValue = parseFloat(form.monthlySalary) || 0;
            // Save salary in localStorage (backend Teacher entity has no salary field)
            saveSalary(targetId, salaryValue);
            // Ensure teacher is in dept mapping
            const key = `dept_teachers_${orgId}_${decoded}`;
            let ids = JSON.parse(localStorage.getItem(key) || '[]');
            if (!ids.includes(targetId)) {
                ids.push(targetId);
                localStorage.setItem(key, JSON.stringify(ids));
            }
            toast.success(modalMode === 'add' ? 'Salary added successfully' : 'Salary updated successfully');
            setModal(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save salary');
        } finally {
            setSaving(false);
        }
    };

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Prepare list for Add dropdown (teachers without salary)
    const deptIds = getDeptTeacherIds();
    const deptTeachersForAdd = deptIds.length > 0
        ? allTeachers.filter(t => deptIds.includes(t.id))
        : allTeachers;
    // All dept teachers available to assign salary
    const availableForAdd = deptTeachersForAdd;

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/departments')} className="hover:text-violet-600">Departments</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Teacher Salary — {decoded}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">View and manage teacher salary records</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Salary
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : salaryTeachers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No salary records found for this department</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Salary" to assign a salary to a teacher.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialization</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {salaryTeachers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{t.teacherId}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-700">{t.userFullName}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-500">{t.userEmail}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-500">{t.specialization}</td>
                                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">₹{t.monthlySalary}</td>
                                    <td className="px-4 py-3.5 text-right relative">
                                        <button onClick={() => toggleMenu(t.id)} className="p-1 rounded hover:bg-gray-100 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                        {openMenuId === t.id && (
                                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-left">
                                                <button onClick={() => openEdit(t)} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Edit
                                                </button>
                                                <button onClick={() => deleteSalary(t)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
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

            <Modal open={modal} onClose={() => setModal(false)} title={modalMode === 'add' ? 'Add Teacher Salary' : 'Update Teacher Salary'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalMode === 'add' && (
                        <F label="Select Teacher *">
                            <Select
                                required
                                value={form.teacherId}
                                onChange={e => {
                                    const id = e.target.value ? Number(e.target.value) : '';
                                    const selected = allTeachers.find(t => t.id === id);
                                    setForm({
                                        ...form,
                                        teacherId: id,
                                        monthlySalary: selected?.monthlySalary || ''
                                    });
                                }}
                            >
                                <option value="">Select Teacher</option>
                                {availableForAdd.map(t => (
                                    <option key={t.id} value={t.id}>{t.userFullName} ({t.teacherId})</option>
                                ))}
                            </Select>
                        </F>
                    )}

                    <F label="Monthly Salary (₹) *">
                        <Input
                            required
                            type="number"
                            step="0.01"
                            value={form.monthlySalary}
                            onChange={e => setForm({ ...form, monthlySalary: e.target.value })}
                            placeholder="e.g. 45000"
                        />
                    </F>
                    <F label="Effective Date">
                        <Input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} />
                    </F>
                    <F label="Notes">
                        <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                    </F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : (modalMode === 'add' ? 'Add Salary' : 'Update Salary')}
                        </button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};

export default TeacherSalary;