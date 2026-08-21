import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const EmployeeSalary = () => {
    const { deptName } = useParams();
    const decoded = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [modal, setModal]         = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [form, setForm]           = useState({ selectedEmpId: '', salary: '', effectiveDate: '', notes: '' });

    useEffect(() => { load(); }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            const res = decoded
                ? await companyApi.getEmployeesByDepartment(orgId, decoded)
                : await companyApi.getEmployeesByOrganization(orgId);
            setEmployees(res.data.data || []);
        } catch { toast.error('Failed to load employees'); }
        finally { setLoading(false); }
    };

    const openAdd = () => {
        setModalMode('add');
        setEditingId(null);
        setForm({ selectedEmpId: '', salary: '', effectiveDate: '', notes: '' });
        setModal(true);
    };

    const openEdit = (emp) => {
        setModalMode('edit');
        setEditingId(emp.id);
        setForm({ selectedEmpId: emp.id, salary: emp.salary || '', effectiveDate: '', notes: '' });
        setOpenMenuId(null);
        setModal(true);
    };

    const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const targetId = modalMode === 'add' ? parseInt(form.selectedEmpId) : editingId;
        const emp = employees.find(e => e.id === targetId);
        if (!emp) { toast.error('Employee not found'); setSaving(false); return; }
        try {
            await companyApi.updateEmployee(targetId, {
                employeeId:     emp.employeeId,
                designation:    emp.designation,
                department:     decoded,
                joiningDate:    emp.joiningDate,
                salary:         parseFloat(form.salary),
                status:         emp.status || 'ACTIVE',
                userId:         emp.userId,
                organizationId: parseInt(orgId),
            });
            toast.success(modalMode === 'add' ? 'Salary added successfully' : 'Salary updated successfully');
            setModal(false);
            load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update salary'); }
        finally { setSaving(false); }
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/company/departments')} className="hover:text-violet-600">Departments</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Employee Salary — {decoded}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">View and manage employee salary records</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Salary
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : employees.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No employees found</p>
                        <p className="text-xs text-gray-400 mt-1">Add employees first from the Employees section</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                {['Employee ID','Name','Email','Designation','Monthly Salary','Action'].map(h =>
                                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
                                )}
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{emp.employeeId}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-700">{emp.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.userEmail}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.designation}</td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                            {emp.salary ? `₹${emp.salary}` : <span className="text-gray-400 font-normal">Not set</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-right relative">
                                            <button onClick={() => toggleMenu(emp.id)} className="p-1 rounded hover:bg-gray-100 transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                            {openMenuId === emp.id && (
                                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-left">
                                                    <button onClick={() => openEdit(emp)} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        Edit
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

            <Modal open={modal} onClose={() => setModal(false)} title={modalMode === 'add' ? 'Add Employee Salary' : 'Update Employee Salary'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalMode === 'add' && (
                        <F label="Select Employee *">
                            <Select required value={form.selectedEmpId} onChange={e => setForm({ ...form, selectedEmpId: e.target.value })}>
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.userFullName} ({emp.employeeId})</option>
                                ))}
                            </Select>
                        </F>
                    )}
                    <F label="Monthly Salary (₹) *">
                        <Input required type="number" step="0.01" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 50000" />
                    </F>
                    <F label="Effective Date">
                        <Input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} />
                    </F>
                    <F label="Notes">
                        <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                    </F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : modalMode === 'add' ? 'Add Salary' : 'Update Salary'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default EmployeeSalary;
