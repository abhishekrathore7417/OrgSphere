import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { ViewToggle, useViewMode } from '../../components/common/ViewToggle';

const buildNav = (deptName) => [
    { path: '/company/dashboard',                                              label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/company/departments',                                            label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/company/departments/${deptName}/employees`,  label: 'Employees',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { path: `/company/departments/${deptName}/leaves`,     label: 'Leaves',      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { path: `/company/departments/${deptName}/attendance`, label: 'Attendance',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const F = ({ label, children }) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
);
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS = {
    ACTIVE:     'bg-green-50 text-green-700 border-green-100',
    INACTIVE:   'bg-red-50 text-red-600 border-red-100',
    TERMINATED: 'bg-gray-50 text-gray-500 border-gray-100',
};

const EMPTY = { fullName: '', email: '', contactNumber: '', employeeId: '', designation: '', department: '', joiningDate: '', salary: '' };

const Employees = () => {
    const { deptName } = useParams();
    const decoded = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();

    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [modal, setModal]         = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm]           = useState({ ...EMPTY, department: decoded });
    const [viewMode, setViewMode]   = useViewMode('list', 'employees_view');

    useEffect(() => { load(); }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            let res;
            if (decoded) {
                res = await companyApi.getEmployeesByDepartment(orgId, decoded);
            } else {
                res = await companyApi.getEmployeesByOrganization(orgId);
            }
            setEmployees(res.data.data || []);
        } catch { toast.error('Failed to fetch employees'); }
        finally { setLoading(false); }
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const openAdd = () => {
        setEditingId(null);
        setForm({ ...EMPTY, department: decoded });
        setModal(true);
    };

    const openEdit = (emp) => {
        setEditingId(emp.id);
        setForm({
            fullName: emp.userFullName || '',
            email: emp.userEmail || '',
            contactNumber: '',
            employeeId: emp.employeeId || '',
            designation: emp.designation || '',
            department: emp.department || decoded,
            joiningDate: emp.joiningDate || '',
            salary: emp.salary || '',
            userId: emp.userId || '',
        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await companyApi.updateEmployee(editingId, {
                    employeeId:     form.employeeId,
                    designation:    form.designation,
                    department:     form.department,
                    joiningDate:    form.joiningDate,
                    salary:         form.salary ? parseFloat(form.salary) : null,
                    status:         'ACTIVE',
                    userId:         parseInt(form.userId),
                    organizationId: parseInt(orgId),
                });
                toast.success('Employee updated successfully');
            } else {
                const uRes = await userApi.createUser({
                    fullName:       form.fullName,
                    email:          form.email,
                    contactNumber:  form.contactNumber,
                    role:           'EMPLOYEE',
                    organizationId: parseInt(orgId),
                });
                const uid = uRes.data.data?.id;
                const empRes = await companyApi.createEmployee({
                    employeeId:     form.employeeId,
                    designation:    form.designation,
                    department:     form.department,
                    joiningDate:    form.joiningDate,
                    salary:         form.salary ? parseFloat(form.salary) : null,
                    status:         'ACTIVE',
                    userId:         uid,
                    organizationId: parseInt(orgId),
                });
                // Store employee-department mapping in localStorage (for attendance/leaves filtering)
                if (uid) {
                    const deptKey = `dept_employees_${orgId}_${decoded}`;
                    const existing = JSON.parse(localStorage.getItem(deptKey) || '[]');
                    if (!existing.includes(uid)) {
                        localStorage.setItem(deptKey, JSON.stringify([...existing, uid]));
                    }
                }
                toast.success('Employee added successfully');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save employee');
        } finally { setSaving(false); }
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/company/departments')} className="hover:text-violet-600">Departments</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Employees — {decoded}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Manage employees in this department</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
                        <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Add Employee
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : employees.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No employees in {decoded}</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Employee" to get started</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map(emp => (
                            <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
                                        {emp.userFullName?.charAt(0)?.toUpperCase() || 'E'}
                                    </div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS[emp.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{emp.status}</span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 truncate">{emp.userFullName}</h3>
                                <p className="text-xs text-gray-400 truncate">{emp.userEmail}</p>
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">ID</span>
                                        <span className="font-semibold text-gray-700">{emp.employeeId}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Role</span>
                                        <span className="font-semibold text-gray-700">{emp.designation || '—'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Salary</span>
                                        <span className="font-semibold text-gray-700">{emp.salary ? `₹${emp.salary}` : '—'}</span>
                                    </div>
                                </div>
                                <button onClick={() => openEdit(emp)} className="mt-3 w-full text-xs text-center text-violet-600 font-semibold hover:underline">Edit</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                {['Employee ID','Name','Email','Designation','Department','Salary','Status','Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{emp.employeeId}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-700">{emp.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.userEmail}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.designation}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.department}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.salary ? `₹${emp.salary}` : '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS[emp.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{emp.status}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => openEdit(emp)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Employee' : 'Add Employee'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!editingId && (
                        <>
                            <F label="Full Name *"><Input required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Rahul Sharma" /></F>
                            <div className="grid grid-cols-2 gap-3">
                                <F label="Email *"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></F>
                                <F label="Contact Number *"><Input required value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} placeholder="10-digit mobile" /></F>
                            </div>
                        </>
                    )}
                    <F label="Employee ID *"><Input required value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP001" /></F>
                    <F label="Designation *"><Input required value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Software Engineer" /></F>
                    <F label="Department *"><Input required value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Engineering" /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Joining Date *"><Input required type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} /></F>
                        <F label="Salary (₹)"><Input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="Monthly salary" /></F>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Employees;
