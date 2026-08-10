import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useParams, useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {schoolApi} from '../../api/schoolApi';
import {userApi} from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';
import {ViewToggle, useViewMode} from '../../components/common/ViewToggle';

const buildNav = (classroomId) => [
    {
        path: '/school/dashboard',
        label: 'Dashboard',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
    },
    {
        path: '/school/classrooms',
        label: 'Classrooms',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
    },
    {
        path: `/school/classrooms/${classroomId}/students`,
        label: 'Students',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
    },
    {
        path: `/school/classrooms/${classroomId}/teachers`,
        label: 'Teachers',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
    },
    {
        path: `/school/classrooms/${classroomId}/fees`,
        label: 'Fees',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    },
];

const F = ({label, children}) => <div><label
    className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"/>;

const EMPTY = { fullName: '', email: '', contactNumber: '', admissionDate: '', className: '', section: '', session: '', rollNumber: '', guardianName: '', guardianContact: '', status: 'ACTIVE', optionalFees: [], classroomId: '' };

const Students = () => {
    const {classroomId} = useParams();
    const navigate = useNavigate();

    const {user, organizationId: reduxOrgId} = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId = localStorage.getItem('organizationId');
    const orgId = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const [students, setStudents] = useState([]);
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [viewMode, setViewMode] = useViewMode('list', 'students_view');

    // New filtering state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');

    useEffect(() => {
        loadClassroom();
    }, [classroomId]);

    const loadClassroom = async () => {
        try {
            const cr = await schoolApi.getClassroom(classroomId);
            setClassroom(cr.data.data);
            const res = await schoolApi.getStudentsByClassroom(classroomId);
            setStudents(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };
    const set = (key, val) => setForm(f => ({...f, [key]: val}));
    const openAdd = () => {
        setEditingId(null);
        setForm({
            ...EMPTY,
            className: classroom?.classroomName || '',
            section: classroom?.section || '',
            session: classroom?.session || '',
            classroomId: classroomId  // 👈 current classroom ID
        });
        setModal(true);
    };

    const openEdit = (s) => {
        setEditingId(s.id);
        setForm({
            fullName: s.userFullName || '', email: s.userEmail || '', contactNumber: '',
            // studentId: s.studentId || '',  // <-- REMOVED
            admissionDate: s.admissionDate || '',
            className: s.className || '', section: s.section || '',
            session: s.session || classroom?.session || '',
            rollNumber: s.rollNumber || '', guardianName: s.guardianName || '',
            guardianContact: s.guardianContact || '',
            status: s.status || 'ACTIVE',
            optionalFees: s.optionalFeeTypes ? s.optionalFeeTypes.split(',') : [],
            userId: s.userId || '',
            classroomId: s.classroomId || classroomId,  // 👈 use existing or current
        });
        setModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await schoolApi.updateStudent(editingId, {
                    // studentId: form.studentId,  // <-- REMOVED (auto-generated)
                    admissionDate: form.admissionDate,
                    className: form.className,
                    section: form.section,
                    rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
                    guardianName: form.guardianName,
                    guardianContact: form.guardianContact,
                    status: form.status,
                    session: form.session,
                    optionalFeeTypes: form.optionalFees.join(','),
                    userId: parseInt(form.userId),
                    organizationId: parseInt(orgId),
                    classroomId: parseInt(form.classroomId)  // 👈 ADD THIS
                });
                toast.success('Student updated successfully');
            } else {
                const uRes = await userApi.createUser({
                    fullName: form.fullName, email: form.email,
                    contactNumber: form.contactNumber,
                    role: 'STUDENT', organizationId: parseInt(orgId),
                });
                const uid = uRes.data.data?.id;
                await schoolApi.createStudent({
                    // studentId: form.studentId,  // <-- REMOVED (auto-generated)
                    admissionDate: form.admissionDate,
                    className: form.className,
                    section: form.section,
                    rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
                    guardianName: form.guardianName,
                    guardianContact: form.guardianContact,
                    status: form.status,
                    session: form.session,
                    optionalFeeTypes: form.optionalFees.join(','),
                    userId: uid,
                    organizationId: parseInt(orgId),
                    classroomId: parseInt(form.classroomId)  // 👈 ADD THIS
                });
                toast.success('Student enrolled successfully');
            }
            setModal(false);
            loadClassroom();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save student');
        } finally {
            setSaving(false);
        }
    };

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
    const inactiveStudents = students.filter(s => s.status === 'INACTIVE').length;

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/dashboard')} className="hover:text-blue-600">Dashboard
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <button onClick={() => navigate('/school/classrooms')} className="hover:text-blue-600">Classrooms
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <button onClick={() => navigate(`/school/classrooms/${classroomId}/students`)}
                            className="hover:text-blue-600">{classroom?.classroomName || `Class-${classroomId}`}</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <span className="text-gray-700 font-medium">Students</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Students
                            — {classroom?.classroomName || `Class-${classroomId}`}</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage student enrollment and records</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
                        <div
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div
                                className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{totalStudents}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                            </div>
                        </div>
                        <div
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div
                                className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{activeStudents}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
                            </div>
                        </div>
                        <div
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div
                                className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-800">{inactiveStudents}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Inactive</p>
                            </div>
                        </div>
                        <div
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[140px] shadow-sm">
                            <div
                                className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Class</p>
                                <p className="text-lg font-semibold text-gray-800">{classroom?.classroomName || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search students by name, roll no, or email..." value={search}
                               onChange={(e) => setSearch(e.target.value)}
                               className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-gray-700 font-medium">
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <ViewToggle viewMode={viewMode} onChange={setViewMode}/>
                        <button onClick={openAdd}
                                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                title="Add Student">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center">
                        <div
                            className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
                    </div>
                ) : students.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No students enrolled</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Student" to enroll your first student</p>
                    </div>
                ) : (() => {
                    const filtered = students.filter(s => {
                        const matchSearch = !search || s.userFullName?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase()) || s.userEmail?.toLowerCase().includes(search.toLowerCase());
                        const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
                        return matchSearch && matchStatus;
                    });

                    if (filtered.length === 0) {
                        return (
                            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                <p className="text-sm font-medium text-gray-700">No students found</p>
                                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter.</p>
                            </div>
                        );
                    }

                    return viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map((s, idx) => {
                                // Assign a color based on index
                                const colors = [
                                    {
                                        bg: 'bg-purple-100',
                                        text: 'text-purple-700',
                                        border: 'border-purple-300',
                                        icon: 'text-purple-500',
                                        hoverBg: 'hover:bg-purple-50',
                                        switchBg: 'bg-purple-600'
                                    },
                                    {
                                        bg: 'bg-green-100',
                                        text: 'text-green-700',
                                        border: 'border-green-300',
                                        icon: 'text-green-500',
                                        hoverBg: 'hover:bg-green-50',
                                        switchBg: 'bg-green-600'
                                    },
                                    {
                                        bg: 'bg-blue-100',
                                        text: 'text-blue-700',
                                        border: 'border-blue-300',
                                        icon: 'text-blue-500',
                                        hoverBg: 'hover:bg-blue-50',
                                        switchBg: 'bg-blue-600'
                                    },
                                ];
                                const pal = colors[idx % colors.length];

                                return (
                                    <div key={s.id}
                                         className={`bg-white rounded-2xl border ${pal.border} overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group`}>
                                        <div className="p-4 flex-1">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div
                                                    className={`w-11 h-11 rounded-full ${pal.bg} ${pal.text} flex items-center justify-center font-medium text-lg shrink-0 shadow-sm`}>
                                                    {s.userFullName?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">{s.userFullName}</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">{s.studentId}</p>
                                                </div>

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                                        try {
                                                            await schoolApi.updateStudent(s.id, {
                                                                studentId: s.studentId,
                                                                admissionDate: s.admissionDate,
                                                                className: s.className,
                                                                section: s.section,
                                                                rollNumber: s.rollNumber ? parseInt(s.rollNumber) : null,
                                                                guardianName: s.guardianName,
                                                                guardianContact: s.guardianContact,
                                                                status: newStatus,
                                                                optionalFeeTypes: s.optionalFeeTypes,
                                                                userId: s.userId,
                                                                organizationId: parseInt(orgId),
                                                            });
                                                            toast.success(`Student marked as ${newStatus}`);
                                                            loadClassroom();
                                                        } catch {
                                                            toast.error('Failed to update status');
                                                        }
                                                    }}
                                                    title="Toggle Status"
                                                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${s.status === 'ACTIVE' ? pal.switchBg : 'bg-gray-300'}`}
                                                >
                                                    <div
                                                        className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${s.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'}`}/>
                                                </button>
                                            </div>

                                            <div className="space-y-2 mb-2 px-1">
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Email:</span>
                                                    <span className="truncate flex-1">{s.userEmail || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                                        <path
                                                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Class:</span>
                                                    <span className="">{s.className || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Section:</span>
                                                    <span className="">{s.section || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Session:</span>
                                                    <span className="">{s.session || classroom?.session || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <span
                                                        className={`h-4 w-4 mr-2 shrink-0 font-medium flex items-center justify-center ${pal.icon}`}>#</span>
                                                    <span className="w-24 text-gray-600 font-medium">Roll No.:</span>
                                                    <span className="">{s.rollNumber || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Guardian:</span>
                                                    <span className="truncate flex-1">{s.guardianName || '—'}</span>
                                                </div>
                                                <div className="flex items-center text-[13px] text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                                    </svg>
                                                    <span className="w-24 text-gray-600 font-medium">Contact:</span>
                                                    <span className="truncate flex-1">{s.guardianContact || '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 pt-0 mt-2">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                openEdit(s);
                                            }}
                                                    className={`w-full flex items-center justify-center gap-1.5 py-2 bg-white ${pal.text} ${pal.hoverBg} border ${pal.border} text-xs font-medium rounded-xl transition-colors`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                     strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                                </svg>
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {['Student ID', 'Name', 'Email', 'Class', 'Section', 'Roll No', 'Status', 'Guardian', 'Action'].map(h => (
                                        <th key={h}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {filtered.map(s => (
                                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{s.studentId}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-800 font-medium">{s.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.userEmail}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.className}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.section || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.rollNumber || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                    {s.status}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.guardianName || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => openEdit(s)} title="Edit"
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                     strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })()}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Student' : 'Add Student'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!editingId && (
                        <>
                            <F label="Full Name *"><Input required value={form.fullName}
                                                          onChange={e => set('fullName', e.target.value)}
                                                          placeholder="e.g. Arjun Singh"/></F>
                            <div className="grid grid-cols-2 gap-3">
                                <F label="Email *"><Input required type="email" value={form.email}
                                                          onChange={e => set('email', e.target.value)}
                                                          placeholder="student@email.com"/></F>
                                <F label="Contact Number *"><Input required value={form.contactNumber}
                                                                   onChange={e => set('contactNumber', e.target.value)}
                                                                   placeholder="Mobile number"/></F>
                            </div>
                        </>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Class *"><Input required value={form.className}
                                                  onChange={e => set('className', e.target.value)}
                                                  placeholder="e.g. 10"/></F>
                        <F label="Section"><Input value={form.section} onChange={e => set('section', e.target.value)}
                                                  placeholder="e.g. A"/></F>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <F label="Admission Date *"><Input required type="date" value={form.admissionDate}
                                                           onChange={e => set('admissionDate', e.target.value)}/></F>
                        <F label="Roll Number"><Input type="number" value={form.rollNumber}
                                                      onChange={e => set('rollNumber', e.target.value)}
                                                      placeholder="Roll no."/></F>
                        <F label="Session"><Input value={form.session} onChange={e => set('session', e.target.value)}
                                                  placeholder="e.g. 2025-26"/></F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Guardian Name"><Input value={form.guardianName}
                                                        onChange={e => set('guardianName', e.target.value)}
                                                        placeholder="Parent/Guardian name"/></F>
                        <F label="Guardian Contact"><Input value={form.guardianContact}
                                                           onChange={e => set('guardianContact', e.target.value)}
                                                           placeholder="Contact number"/></F>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <div className="mb-2">
                            <label className="text-xs font-semibold text-gray-700">Optional Fees Opt-In</label>
                            <p className="text-[10px] text-gray-400">School & Exam fees are compulsory. Select other
                                fees applicable to this student.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['TRANSPORT', 'LIBRARY', 'SPORTS', 'HOSTEL', 'OTHER'].map(f => (
                                <label key={f}
                                       className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={form.optionalFees.includes(f)}
                                        onChange={(e) => {
                                            const opts = new Set(form.optionalFees);
                                            if (e.target.checked) opts.add(f); else opts.delete(f);
                                            set('optionalFees', Array.from(opts));
                                        }}
                                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </div>

                    {editingId && (
                        <div className="pt-2 border-t border-gray-100">
                            <F label="Account Status">
                                <select
                                    value={form.status}
                                    onChange={e => set('status', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 font-medium"
                                >
                                    <option value="ACTIVE">Active (Enrolled)</option>
                                    <option value="INACTIVE">Inactive (Dropped/Alumni)</option>
                                </select>
                            </F>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setModal(false)}
                                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel
                        </button>
                        <button type="submit" disabled={saving}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};

export default Students;
