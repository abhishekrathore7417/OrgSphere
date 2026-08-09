import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';

const STATUS_STYLE = {
    ACTIVE:   'bg-green-50 text-green-700 border-green-100',
    INACTIVE: 'bg-gray-50 text-gray-500 border-gray-100',
    ALUMNI:   'bg-blue-50 text-blue-600 border-blue-100',
};

const SchoolAllStudents = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);
    const navigate = useNavigate();

    const [students,   setStudents]   = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState('');
    const [classFilter,setClassFilter]= useState('ALL');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [stuRes, clsRes] = await Promise.allSettled([
                schoolApi.getStudentsByOrganization(orgId),
                schoolApi.getClassroomsByOrganization(orgId),
            ]);
            const allStudents   = stuRes.status   === 'fulfilled' ? (stuRes.value.data.data  || []) : [];
            const allClassrooms = clsRes.status === 'fulfilled' ? (clsRes.value.data.data  || []) : [];
            // Only ACTIVE students shown everywhere
            setStudents(allStudents.filter(s => s.status === 'ACTIVE'));
            // Only ACTIVE classrooms in dropdown
            setClassrooms(allClassrooms.filter(c => c.status === 'ACTIVE'));
        } catch { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    const filtered = students.filter(s => {
        const matchSearch = !search ||
            s.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber?.toString().includes(search);
        // Students don't have classroomId — match by classroomName via className field
        const matchClass = classFilter === 'ALL' || s.classroomId?.toString() === classFilter ||
            classrooms.find(c => c.id?.toString() === classFilter)?.classroomName === s.className;
        return matchSearch && matchClass;
    });

    // Match student to classroom: student.className === classroom.classroomName
    const getClassroomForStudent = (s) => {
        // Try direct classroomId first, fallback to className matching
        if (s.classroomId) {
            const cls = classrooms.find(c => c.id === s.classroomId);
            if (cls) return cls;
        }
        // className match (e.g. "Class-10A" or "1A")
        return classrooms.find(c =>
            c.classroomName === s.className ||
            c.classroomName?.toLowerCase() === s.className?.toLowerCase()
        ) || null;
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-violet-600">Dashboard</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">All Students</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">All Students</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} of {students.length} students across all classrooms</p>
                    </div>
                    <button onClick={() => navigate('/school/classrooms')}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Student
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Students', value: students.length,                                       color: 'bg-violet-50 text-violet-700 border-violet-100' },
                        { label: 'Active',          value: students.filter(s=>s.status==='ACTIVE').length,       color: 'bg-green-50 text-green-700 border-green-100'   },
                        { label: 'Classrooms',      value: classrooms.length,                                    color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                        { label: 'Alumni',          value: students.filter(s=>s.status==='ALUMNI').length,       color: 'bg-blue-50 text-blue-700 border-blue-100'      },
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
                        placeholder="Search name, student ID, roll number..."
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                        <option value="ALL">All Classrooms</option>
                        {classrooms.map(c => <option key={c.id} value={c.id.toString()}>{c.classroomName}</option>)}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                        <p className="text-sm font-semibold text-gray-600">No students found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Student ID','Name','Email','Classroom','Roll No','Class','Section','Status','Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(s => {
                                    const cls = getClassroomForStudent(s);
                                    return (
                                    <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-semibold text-violet-700">{s.studentId}</td>
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{s.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.userEmail}</td>
                                        <td className="px-4 py-3.5">
                                            {cls ? (
                                                <button onClick={() => navigate(`/school/classrooms/${cls.id}/students`)}
                                                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors">
                                                    {cls.classroomName}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">{s.className || '—'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-600">{s.rollNumber || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.className || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.section || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[s.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {cls && (
                                                <button onClick={() => navigate(`/school/classrooms/${cls.id}/students`)}
                                                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold hover:underline">
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
};

export default SchoolAllStudents;
