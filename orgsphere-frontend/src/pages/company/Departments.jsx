import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';

const NAV = [
    { path: '/company/dashboard',   label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/company/departments', label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
];

const Field = ({ label, children }) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
);
const Input  = (props) => <input    {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Textarea = (props) => <textarea {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />;

const EMPTY = { departmentName: '', description: '' };

const Departments = () => {
    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

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

    const openAdd = () => { setEditingId(null); setForm(EMPTY); setModal(true); };

    const openEdit = (dept) => {
        setEditingId(dept.id);
        setForm({ departmentName: dept.departmentName, description: dept.description || '' });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await companyApi.updateDepartment(editingId, { ...form, organizationId: parseInt(orgId) });
                toast.success('Department updated successfully');
            } else {
                await companyApi.createDepartment({ ...form, organizationId: parseInt(orgId) });
                toast.success('Department created successfully');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save department');
        } finally { setSaving(false); }
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Select a department to manage its employees, leaves and attendance</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Department
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-60"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : departments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">No departments yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Department" to create one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <button
                                        onClick={() => openEdit(dept)}
                                        className="text-xs text-violet-500 hover:text-violet-700 font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="font-semibold text-gray-800 text-sm">{dept.departmentName}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dept.description || 'No description'}</p>
                                <button
                                    onClick={() => navigate(`/company/departments/${encodeURIComponent(dept.departmentName)}/employees`)}
                                    className="mt-4 w-full text-xs text-center bg-violet-50 hover:bg-violet-100 text-violet-700 font-medium py-1.5 rounded-lg transition-colors"
                                >
                                    View Department
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Department' : 'Add Department'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Department Name *">
                        <Input required value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })} placeholder="e.g. Engineering" />
                    </Field>
                    <Field label="Description">
                        <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this department" />
                    </Field>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Department'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Departments;
