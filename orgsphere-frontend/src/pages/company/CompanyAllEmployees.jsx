import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import CompanyLayout from '../../components/layout/CompanyLayout';

const STATUS_STYLE = {
    ACTIVE:      'bg-green-50 text-green-700 border-green-100',
    INACTIVE:    'bg-gray-50 text-gray-500 border-gray-100',
    TERMINATED:  'bg-red-50 text-red-600 border-red-100',
};

const CompanyAllEmployees = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [departments, setDepartments] = useState([]);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [empRes, deptRes] = await Promise.allSettled([
                companyApi.getEmployeesByOrganization(orgId),
                companyApi.getDepartmentsByOrganization(orgId),
            ]);
            const emps  = empRes.status  === 'fulfilled' ? (empRes.value.data.data  || []) : [];
            const depts = deptRes.status === 'fulfilled' ? (deptRes.value.data.data || []) : [];
            setEmployees(emps);
            setDepartments(depts.map(d => d.name || d.departmentName || ''));
        } catch { toast.error('Failed to load employees'); }
        finally { setLoading(false); }
    };

    const filtered = employees.filter(e => {
        const matchSearch = !search ||
            e.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
            e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
            e.designation?.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'ALL' || e.department === deptFilter;
        return matchSearch && matchDept;
    });

    return (
        <CompanyLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/company/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Employees</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">All Employees</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} of {employees.length} employees across all departments</p>
                    </div>
                    <button onClick={() => navigate('/company/departments')}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, ID, designation..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                        <option value="ALL">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total',      value: employees.length,                                     color: 'bg-violet-50 text-violet-700 border-violet-100' },
                        { label: 'Active',     value: employees.filter(e=>e.status==='ACTIVE').length,     color: 'bg-green-50 text-green-700 border-green-100' },
                        { label: 'Inactive',   value: employees.filter(e=>e.status==='INACTIVE').length,   color: 'bg-gray-50 text-gray-600 border-gray-100' },
                        { label: 'Departments',value: departments.length,                                   color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                    ].map(s => (
                        <div key={s.label} className={`${s.color} border rounded-2xl px-4 py-3`}>
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                        <p className="text-sm font-semibold text-gray-600">No employees found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Emp ID','Name','Email','Department','Designation','Salary','Status','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-semibold text-violet-700">{emp.employeeId}</td>
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{emp.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.userEmail}</td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => navigate(`/company/departments/${encodeURIComponent(emp.department)}/employees`)}
                                                className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                {emp.department || '—'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{emp.designation}</td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">
                                            {emp.salary ? `₹${emp.salary.toLocaleString()}` : <span className="text-gray-300 font-normal">Not set</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[emp.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => navigate(`/company/departments/${encodeURIComponent(emp.department)}/employees`)}
                                                className="text-xs text-violet-600 hover:text-violet-800 font-semibold hover:underline">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
};

export default CompanyAllEmployees;
