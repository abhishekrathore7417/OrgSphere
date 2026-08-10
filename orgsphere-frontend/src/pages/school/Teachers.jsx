import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useParams, useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {schoolApi} from '../../api/schoolApi';
import {userApi} from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';
import { ViewToggle, useViewMode } from '../../components/common/ViewToggle';

const buildNav = (deptName) => [
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
        path: '/school/departments',
        label: 'Departments',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
    },
    {
        path: `/school/departments/${deptName}/teachers`,
        label: 'Teachers',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
    },
    {
        path: `/school/departments/${deptName}/attendance`,
        label: 'Attendance',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    },
    {
        path: `/school/departments/${deptName}/leaves`,
        label: 'Leaves',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
    },
    {
        path: `/school/departments/${deptName}/salary`,
        label: 'Salary',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    },
];

const F = ({label, children}) => <div><label
    className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input   {...props}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"/>;
const Select = ({children, ...props}) => <select {...props}
                                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-100',
    ON_LEAVE: 'bg-amber-50 text-amber-600 border-amber-100',
    TERMINATED: 'bg-red-50 text-red-600 border-red-100'
};
const EMPTY = {
    fullName: '',
    email: '',
    contactNumber: '',
    teacherId: '',
    specialization: '',
    qualification: '',
    experienceYears: '',
    joiningDate: '',
    status: 'ACTIVE'
};

const Teachers = () => {
    const {deptName} = useParams();
    const decoded = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();
    const {user, organizationId: reduxOrgId} = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId = localStorage.getItem('organizationId');
    const orgId = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [viewMode, setViewMode] = useViewMode('list', 'teachers_view');

    // New filtering state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');

    useEffect(() => {
        load();
    }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await schoolApi.getTeachersByOrganization(orgId);
            const all = res.data.data || [];
            // Filter teachers by department using localStorage mapping
            const deptKey = `dept_teachers_${orgId}_${decoded}`;
            const storedIds = JSON.parse(localStorage.getItem(deptKey) || '[]');
            const filtered = storedIds.length > 0
                ? all.filter(t => storedIds.includes(t.id))
                : [];
            setTeachers(filtered);
        } catch {
            toast.error('Failed to fetch teachers');
        } finally {
            setLoading(false);
        }
    };

    const set = (k, v) => setForm(f => ({...f, [k]: v}));
    const openAdd = () => {
        setEditingId(null);
        setForm(EMPTY);
        setModal(true);
    };
    const openEdit = (t) => {
        setEditingId(t.id);
        setForm({
            fullName: t.userFullName || '',
            email: t.userEmail || '',
            contactNumber: '',
            teacherId: t.teacherId || '',
            specialization: t.specialization || '',
            qualification: t.qualification || '',
            experienceYears: t.experienceYears || '',
            joiningDate: t.joiningDate || '',
            status: t.status || 'ACTIVE',
            userId: t.userId || t.user?.id  // <--- YEH LINE ADD KARI HAI

        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await schoolApi.updateTeacher(editingId, {
                    teacherId: form.teacherId,
                    specialization: form.specialization,
                    qualification: form.qualification,
                    experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
                    joiningDate: form.joiningDate,
                    status: form.status,
                    userId: form.userId,           // <--- YEH LINE ADD KARI HAI
                    organizationId: parseInt(orgId)
                });
                toast.success('Teacher updated');
            } else {
                const uRes = await userApi.createUser({
                    fullName: form.fullName,
                    email: form.email,
                    contactNumber: form.contactNumber,
                    role: 'TEACHER',
                    organizationId: parseInt(orgId)
                });
                const uid = uRes.data.data?.id;
                const teacherRes = await schoolApi.createTeacher({
                    teacherId: form.teacherId,
                    specialization: form.specialization,
                    qualification: form.qualification,
                    experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
                    joiningDate: form.joiningDate,
                    status: form.status,
                    userId: uid,
                    organizationId: parseInt(orgId)
                });
                // Store teacher-department mapping in localStorage
                const newTeacherId = teacherRes.data.data?.id;
                if (newTeacherId) {
                    const deptKey = `dept_teachers_${orgId}_${decoded}`;
                    const existing = JSON.parse(localStorage.getItem(deptKey) || '[]');
                    localStorage.setItem(deptKey, JSON.stringify([...existing, newTeacherId]));
                }
                toast.success('Teacher added');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/school/departments')}
                            className="hover:text-violet-600">Departments
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Teachers — {decoded}</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage teacher profiles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
                        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                            Add Teacher
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-gray-700 font-medium">
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="TERMINATED">Terminated</option>
                    </select>
                </div>

                {loading ? <div className="flex justify-center h-60 items-center">
                        <div
                            className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
                    </div>
                    : teachers.length === 0 ?
                        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p
                            className="text-sm font-medium text-gray-700">No teachers yet</p><p
                            className="text-xs text-gray-400 mt-1">Click "Add Teacher" to get started</p></div>
                        : (() => {
                            const filtered = teachers.filter(t => {
                                const matchSearch = !search || t.userFullName?.toLowerCase().includes(search.toLowerCase()) || t.teacherId?.toLowerCase().includes(search.toLowerCase()) || t.userEmail?.toLowerCase().includes(search.toLowerCase());
                                const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
                                return matchSearch && matchStatus;
                            });

                            if (filtered.length === 0) {
                                return (
                                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                        <p className="text-sm font-medium text-gray-700">No teachers found</p>
                                    </div>
                                );
                            }

                            return viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filtered.map((t, idx) => {
                                        const initials = (t.userFullName || 'T').slice(0, 1).toUpperCase();
                                        const colors = [
                                            { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: 'text-purple-500', hoverBg: 'hover:bg-purple-50', switchBg: 'bg-purple-600' },
                                            { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: 'text-green-500', hoverBg: 'hover:bg-green-50', switchBg: 'bg-green-600' },
                                            { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: 'text-blue-500', hoverBg: 'hover:bg-blue-50', switchBg: 'bg-blue-600' },
                                        ];
                                        const pal = colors[idx % colors.length];

                                        return (
                                            <div key={t.id} className={`bg-white rounded-2xl border ${pal.border} overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group`}>
                                                <div className="p-4 flex-1">
                                                    <div className="flex items-center gap-3 mb-5">
                                                        <div className={`w-11 h-11 rounded-full ${pal.bg} ${pal.text} flex items-center justify-center font-medium text-lg shrink-0 shadow-sm`}>
                                                            {initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">{t.userFullName}</h3>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">{t.teacherId}</p>
                                                        </div>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const newStatus = t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                                                try {
                                                                    await schoolApi.updateTeacher(t.id, {
                                                                        teacherId: t.teacherId, specialization: t.specialization,
                                                                        qualification: t.qualification, experienceYears: t.experienceYears,
                                                                        joiningDate: t.joiningDate, status: newStatus,
                                                                        userId: t.userId, organizationId: parseInt(orgId)
                                                                    });
                                                                    toast.success(`Teacher marked as ${newStatus}`);
                                                                    load();
                                                                } catch { toast.error('Failed to update status'); }
                                                            }}
                                                            title="Toggle Status"
                                                            className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${t.status === 'ACTIVE' ? pal.switchBg : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${t.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2 mb-2 px-1">
                                                        <div className="flex items-center text-[13px] text-gray-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            <span className="w-24 text-gray-600 font-medium">Email:</span>
                                                            <span className="truncate flex-1">{t.userEmail || '—'}</span>
                                                        </div>
                                                        <div className="flex items-center text-[13px] text-gray-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                            <span className="w-24 text-gray-600 font-medium">Subject:</span>
                                                            <span className="truncate flex-1">{t.specialization || '—'}</span>
                                                        </div>
                                                        <div className="flex items-center text-[13px] text-gray-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                            <span className="w-24 text-gray-600 font-medium">Qualif.:</span>
                                                            <span className="truncate flex-1">{t.qualification || '—'}</span>
                                                        </div>
                                                        <div className="flex items-center text-[13px] text-gray-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 shrink-0 ${pal.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span className="w-24 text-gray-600 font-medium">Experience:</span>
                                                            <span className="truncate flex-1">{t.experienceYears ? `${t.experienceYears} Years` : '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3 pt-0 mt-2">
                                                    <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className={`w-full flex items-center justify-center gap-1.5 py-2 bg-white ${pal.text} ${pal.hoverBg} border ${pal.border} text-xs font-medium rounded-xl transition-colors`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
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
                                        <tr className="border-b border-gray-100 bg-gray-50/50">{['Teacher ID', 'Name', 'Email', 'Specialization', 'Qualification', 'Experience', 'Status', 'Action'].map(h =>
                                            <th key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                        {filtered.map(t => (
                                            <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{t.teacherId}</td>
                                                <td className="px-4 py-3.5 text-sm text-gray-800 font-medium">{t.userFullName}</td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500">{t.userEmail}</td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500">{t.specialization}</td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500">{t.qualification}</td>
                                                <td className="px-4 py-3.5 text-sm text-gray-500">{t.experienceYears ? `${t.experienceYears} yrs` : '—'}</td>
                                                <td className="px-4 py-3.5"><span
                                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[t.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{t.status}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEdit(t)} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        {/* Soft delete toggle */}
                                                        <button
                                                            onClick={async () => {
                                                                const newStatus = t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                                                try {
                                                                    await schoolApi.updateTeacher(t.id, {
                                                                        teacherId: t.teacherId, specialization: t.specialization,
                                                                        qualification: t.qualification, experienceYears: t.experienceYears,
                                                                        joiningDate: t.joiningDate, status: newStatus,
                                                                        userId: t.userId, organizationId: parseInt(orgId)
                                                                    });
                                                                    toast.success(`Teacher marked as ${newStatus}`);
                                                                    load();
                                                                } catch { toast.error('Failed to update status'); }
                                                            }}
                                                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                                                                t.status === 'ACTIVE'
                                                                    ? 'border-red-100 text-red-500 hover:bg-red-50'
                                                                    : 'border-green-100 text-green-600 hover:bg-green-50'
                                                            }`}>
                                                            {t.status === 'ACTIVE' ? 'Inactive' : 'Active'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
            </div>
            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Teacher' : 'Add Teacher'}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!editingId && (<><F label="Full Name *"><Input required value={form.fullName}
                                                                    onChange={e => set('fullName', e.target.value)}
                                                                    placeholder="e.g. Priya Sharma"/></F>
                        <div className="grid grid-cols-2 gap-3"><F label="Email *"><Input required type="email"
                                                                                          value={form.email}
                                                                                          onChange={e => set('email', e.target.value)}
                                                                                          placeholder="teacher@email.com"/></F><F
                            label="Contact *"><Input required value={form.contactNumber}
                                                     onChange={e => set('contactNumber', e.target.value)}
                                                     placeholder="Mobile number"/></F></div>
                    </>)}
                    <F label="Teacher ID *"><Input required value={form.teacherId}
                                                   onChange={e => set('teacherId', e.target.value)}
                                                   placeholder="e.g. TCH001"/></F>
                    <F label="Specialization *"><Input required value={form.specialization}
                                                       onChange={e => set('specialization', e.target.value)}
                                                       placeholder="e.g. Mathematics"/></F>
                    <F label="Qualification *"><Input required value={form.qualification}
                                                      onChange={e => set('qualification', e.target.value)}
                                                      placeholder="e.g. B.Ed"/></F>
                    <div className="grid grid-cols-2 gap-3"><F label="Joining Date *"><Input required type="date"
                                                                                             value={form.joiningDate}
                                                                                             onChange={e => set('joiningDate', e.target.value)}/></F><F
                        label="Experience (Yrs)"><Input type="number" value={form.experienceYears}
                                                        onChange={e => set('experienceYears', e.target.value)}
                                                        placeholder="5"/></F></div>
                    {editingId && (
                        <div className="pt-2 border-t border-gray-100">
                            <F label="Status">
                                <Select value={form.status} onChange={e => set('status', e.target.value)}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_LEAVE">On Leave</option>
                                    <option value="TERMINATED">Terminated</option>
                                </Select>
                            </F>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)}
                                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel
                        </button>
                        <button type="submit" disabled={saving}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Update' : 'Add Teacher'}</button>
                    </div>
                </form>
            </Modal>
        </SchoolLayout>
    );
};
export default Teachers;
