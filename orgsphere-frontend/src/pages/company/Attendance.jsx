import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyApi } from '../../api/companyApi';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CompanyLayout from '../../components/layout/CompanyLayout';
import Modal from '../../components/ui/Modal';

const buildNav = (deptName) => [
    { path: '/company/dashboard',   label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/company/departments', label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { path: `/company/departments/${deptName}/employees`,  label: 'Employees',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { path: `/company/departments/${deptName}/leaves`,     label: 'Leaves',     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { path: `/company/departments/${deptName}/attendance`, label: 'Attendance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input  = (props) => <input   {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const STATUS_STYLE = {
    PRESENT:  'bg-green-50 text-green-700 border-green-100',
    ABSENT:   'bg-red-50 text-red-600 border-red-100',
    ON_LEAVE: 'bg-amber-50 text-amber-600 border-amber-100',
};

const Attendance = () => {
    const { deptName } = useParams();
    const decoded  = deptName ? decodeURIComponent(deptName) : '';
    const navigate = useNavigate();

    const { user, organizationId: reduxOrgId } = useSelector((state) => state.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' && lsOrgId !== 'undefined' ? parseInt(lsOrgId, 10) : null);

    const today = new Date().toISOString().split('T')[0];
    const EMPTY = { attendanceDate: today, checkInTime: '', checkOutTime: '', status: 'PRESENT', remarks: '', userId: '' };

    const [attendances, setAttendances] = useState([]);
    const [users, setUsers]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [modal, setModal]             = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [form, setForm]               = useState(EMPTY);

    useEffect(() => { load(); loadUsers(); }, [deptName]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await companyApi.getAttendanceByOrganization(orgId);
            const all = res.data.data || [];
            // Filter attendance to only this department's employees using localStorage mapping
            const deptKey = `dept_employees_${orgId}_${decoded}`;
            const storedIds = JSON.parse(localStorage.getItem(deptKey) || '[]');
            if (storedIds.length > 0) {
                setAttendances(all.filter(a => storedIds.includes(a.userId)));
            } else {
                // New department with no employees yet — show empty, not all org data
                setAttendances([]);
            }
        } catch { toast.error('Failed to fetch attendance'); }
        finally { setLoading(false); }
    };

    const loadUsers = async () => {
        try {
            const deptKey = `dept_employees_${orgId}_${decoded}`;
            const storedIds = JSON.parse(localStorage.getItem(deptKey) || '[]');
            const res = await userApi.getUsersByOrganization(orgId);
            const allUsers = res.data.data || [];
            // Show only this dept's employees — empty dept shows empty dropdown
            const filtered = storedIds.length > 0
                ? allUsers.filter(u => u.role === 'EMPLOYEE' && storedIds.includes(u.id))
                : [];
            setUsers(filtered);
        } catch { /* silent */ }
    };

    const openAdd  = () => { setEditingId(null); setForm(EMPTY); setModal(true); };
    const openEdit = (att) => {
        setEditingId(att.id);
        setForm({
            attendanceDate: att.attendanceDate || today,
            checkInTime:    att.checkInTime  ? att.checkInTime.slice(0,5)  : '',
            checkOutTime:   att.checkOutTime ? att.checkOutTime.slice(0,5) : '',
            status:         att.status || 'PRESENT',
            remarks:        att.remarks || '',
            userId:         att.userId || '',
        });
        setModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            attendanceDate: form.attendanceDate,
            status:         form.status,
            remarks:        form.remarks,
            userId:         parseInt(form.userId),
            organizationId: parseInt(orgId),
            checkInTime:    form.checkInTime  ? `${form.checkInTime}:00`  : null,
            checkOutTime:   form.checkOutTime ? `${form.checkOutTime}:00` : null,
        };
        try {
            if (editingId) {
                await companyApi.updateAttendance(editingId, payload);
                toast.success('Attendance updated');
            } else {
                await companyApi.markAttendance(payload);
                toast.success('Attendance marked successfully');
            }
            setModal(false);
            load();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save attendance'); }
        finally { setSaving(false); }
    };

    return (
        <CompanyLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <button onClick={() => navigate('/company/departments')} className="hover:text-violet-600">Departments</button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Attendance — {decoded}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Track daily employee attendance</p>
                    </div>
                    <button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Mark Attendance
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center h-60 items-center"><div className="w-7 h-7 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : attendances.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-sm font-medium text-gray-700">No attendance records</p>
                        <p className="text-xs text-gray-400 mt-1">Mark attendance for employees</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100 bg-gray-50">
                                {['Employee','Date','Check In','Check Out','Status','Remarks','Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {attendances.map(att => (
                                    <tr key={att.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{att.userFullName}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{att.attendanceDate}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{att.checkInTime  || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{att.checkOutTime || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[att.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{att.status}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{att.remarks || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <button onClick={() => openEdit(att)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Attendance' : 'Mark Attendance'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <F label="Select Employee *">
                        <Select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
                            <option value="">-- Select employee --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                        </Select>
                    </F>
                    <F label="Date *"><Input required type="date" value={form.attendanceDate} onChange={e => setForm({...form, attendanceDate: e.target.value})} /></F>
                    <F label="Status *">
                        <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="ON_LEAVE">On Leave</option>
                        </Select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Check In Time"><Input type="time" value={form.checkInTime}  onChange={e => setForm({...form, checkInTime:  e.target.value})} /></F>
                        <F label="Check Out Time"><Input type="time" value={form.checkOutTime} onChange={e => setForm({...form, checkOutTime: e.target.value})} /></F>
                    </div>
                    <F label="Remarks"><Input value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Optional remarks" /></F>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Mark Attendance'}
                        </button>
                    </div>
                </form>
            </Modal>
        </CompanyLayout>
    );
};

export default Attendance;
