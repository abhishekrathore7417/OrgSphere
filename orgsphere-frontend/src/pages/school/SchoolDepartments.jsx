import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';

const NAV = [
    { path: '/school/dashboard',   label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/school/classrooms',  label: 'Classrooms',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: '/school/departments', label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input    = (props) => <input    {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Textarea = (props) => <textarea {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />;

const EMPTY = { departmentName: '', description: '' };

const SchoolDepartments = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [modal, setModal]             = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [form, setForm]               = useState(EMPTY);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await companyApi.getDepartmentsByOrganization(orgId);
            setDepartments(res.data.data || []);
        } catch { toast.error('Failed to fetch departments'); }
        finally { setLoading(false); }
    };

    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (d) => { setEditingId(d.id); setForm({ departmentName: d.departmentName, description: d.description || '' }); setModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editingId) { await companyApi.updateDepartment(editingId, { ...form, organizationId: parseInt(orgId) }); toast.success('Department updated'); }
            else { await companyApi.createDepartment({ ...form, organizationId: parseInt(orgId) }); toast.success('Department created'); }
            setModal(false); load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-blue-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">Departments</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Departments</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage departments, teachers and attendance</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Add Department
                        </button>
                    </div>
                </div>

                {loading ? <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                : departments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No departments yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Department" to create one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments.map(dept => {
                            const initials = (dept.departmentName || 'D').slice(0, 2).toUpperCase();
                            const palettes = [
                                { bg: 'bg-violet-100', text: 'text-violet-700' },
                                { bg: 'bg-blue-100',   text: 'text-blue-700'   },
                                { bg: 'bg-green-100',  text: 'text-green-700'  },
                                { bg: 'bg-amber-100',  text: 'text-amber-700'  },
                                { bg: 'bg-rose-100',   text: 'text-rose-700'   },
                                { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
                            ];
                            const pal = palettes[(dept.departmentName?.charCodeAt(0) || 0) % palettes.length];

                            return (
                                <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all flex flex-col">
                                    <div className="p-4 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-medium text-lg shrink-0 ${pal.bg} ${pal.text}`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">{dept.departmentName}</h3>
                                            </div>
                                            <button onClick={() => openEdit(dept)} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{dept.description || 'No description available for this department.'}</p>
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/school/departments/${encodeURIComponent(dept.departmentName)}/teachers`)}
                                            className="w-full text-xs text-center border border-gray-200 bg-white hover:bg-blue-50 text-blue-600 font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-1.5"
                                        >
                                            View Department
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Department' : 'Add Department'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <F label="Department Name *"><Input required value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })} placeholder="e.g. Science" /></F>
                    <F label="Description"><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Update' : 'Add Department'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};
export default SchoolDepartments;
