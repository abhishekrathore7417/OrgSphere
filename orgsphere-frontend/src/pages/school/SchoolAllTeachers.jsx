import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import { companyApi } from '../../api/companyApi';
import SchoolLayout from '../../components/layout/SchoolLayout';

const STATUS_STYLE = {
    ACTIVE:      'bg-green-50 text-green-700 border-green-100',
    INACTIVE:    'bg-gray-50 text-gray-500 border-gray-100',
    TERMINATED:  'bg-red-50 text-red-600 border-red-100',
};

const SchoolAllTeachers = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [teachers,    setTeachers]    = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [deptFilter,  setDeptFilter]  = useState('ALL');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [tchRes, deptRes] = await Promise.allSettled([
                schoolApi.getTeachersByOrganization(orgId),
                companyApi.getDepartmentsByOrganization(orgId),
            ]);
            const tchrs = tchRes.status  === 'fulfilled' ? (tchRes.value.data.data  || []) : [];
            const depts = deptRes.status === 'fulfilled' ? (deptRes.value.data.data || []) : [];
            setTeachers(tchrs);
            setDepartments(depts);
        } catch { toast.error('Failed to load teachers'); }
        finally { setLoading(false); }
    };

    // Enrich teachers with department from localStorage mapping
    const enriched = teachers.map(t => {
        let dept = '—';
        if (orgId) {
            const allKeys = Object.keys(localStorage);
            for (const key of allKeys) {
                if (key.startsWith(`dept_teachers_${orgId}_`)) {
                    const ids = JSON.parse(localStorage.getItem(key) || '[]');
                    if (ids.includes(t.id)) {
                        dept = key.replace(`dept_teachers_${orgId}_`, '');
                        break;
                    }
                }
            }
        }
        return { ...t, department: dept };
    });

    const filtered = enriched.filter(t => {
        const matchSearch = !search ||
            t.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
            t.teacherId?.toLowerCase().includes(search.toLowerCase()) ||
            t.specialization?.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'ALL' || t.department === deptFilter;
        return matchSearch && matchDept;
    });

    const deptNames = [...new Set(enriched.map(t => t.department).filter(d => d !== '—'))];

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Teachers</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">All Teachers</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} of {teachers.length} teachers across all departments</p>
                    </div>
                    <button onClick={() => navigate('/school/departments')}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Teacher
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Teachers', value: teachers.length,                                     color: 'bg-violet-50 text-violet-700 border-violet-100' },
                        { label: 'Active',          value: teachers.filter(t=>t.status==='ACTIVE').length,     color: 'bg-green-50 text-green-700 border-green-100'   },
                        { label: 'Departments',     value: departments.length,                                  color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                        { label: 'Inactive',        value: teachers.filter(t=>t.status==='INACTIVE').length,   color: 'bg-gray-50 text-gray-600 border-gray-100'      },
                    ].map(s => (
                        <div key={s.label} className={`${s.color} border rounded-2xl px-4 py-3`}>
                            <p className="text-2xl font-extrabold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, ID, specialization..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                        <option value="ALL">All Departments</option>
                        {deptNames.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                        <p className="text-sm font-semibold text-gray-600">No teachers found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Teacher ID','Name','Email','Department','Specialization','Status','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(t => (
                                    <tr key={t.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-semibold text-violet-700">{t.teacherId}</td>
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{t.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.userEmail}</td>
                                        <td className="px-4 py-3.5">
                                            {t.department !== '—' ? (
                                                <button onClick={() => navigate(`/school/departments/${encodeURIComponent(t.department)}/teachers`)}
                                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                    {t.department}
                                                </button>
                                            ) : <span className="text-gray-300 text-sm">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{t.specialization || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[t.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {t.department !== '—' ? (
                                                <button onClick={() => navigate(`/school/departments/${encodeURIComponent(t.department)}/teachers`)}
                                                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold hover:underline">
                                                    View
                                                </button>
                                            ) : (
                                                <button onClick={() => navigate('/school/departments')}
                                                    className="text-xs text-gray-400 hover:text-violet-600 font-semibold hover:underline">
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
};

export default SchoolAllTeachers;
