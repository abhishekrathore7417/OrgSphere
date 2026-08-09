import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;

const AcademicYear = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId = localStorage.getItem('organizationId');
    const orgId = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const EMPTY = { name: '', startDate: '', endDate: '', isCurrent: false };
    const EMPTY_HOLIDAY = { date: '', name: '' };
    
    const [years, setYears] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    
    const [hModal, setHModal] = useState(false);
    const [hForm, setHForm] = useState(EMPTY_HOLIDAY);

    useEffect(() => { loadData(); }, [orgId]);

    const loadData = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [yRes, hRes] = await Promise.all([
                schoolApi.getAcademicYearsByOrganization(orgId),
                schoolApi.getHolidaysByOrganization(orgId)
            ]);
            setYears(yRes.data.data || []);
            setHolidays(hRes.data.data || []);
        } catch (e) {
            toast.error('Failed to load academic data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveYear = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.createAcademicYear({ ...form, organizationId: orgId });
            toast.success('Academic Year created');
            setModal(false);
            loadData();
        } catch (e) {
            toast.error('Failed to create academic year');
        } finally {
            setSaving(false);
        }
    };

    const handleSetCurrent = async (id) => {
        try {
            await schoolApi.setCurrentAcademicYear(id, orgId);
            toast.success('Current year updated');
            loadData();
        } catch (e) {
            toast.error('Failed to set current year');
        }
    };

    const handleSaveHoliday = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.createHoliday({ ...hForm, organizationId: orgId });
            toast.success('Holiday added');
            setHModal(false);
            loadData();
        } catch (e) {
            toast.error('Failed to add holiday');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteHoliday = async (id) => {
        if (!window.confirm('Remove this holiday?')) return;
        try {
            await schoolApi.deleteHoliday(id);
            toast.success('Deleted');
            loadData();
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-8">
                {/* Academic Years Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Academic Years</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Manage school sessions (e.g. 2026-2027)</p>
                        </div>
                        <button onClick={() => { setForm(EMPTY); setModal(true); }}
                                className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-violet-700 transition-colors">
                            + Add Year
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Start Date</th>
                                    <th className="p-4">End Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr>
                                ) : years.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No academic years set.</td></tr>
                                ) : (
                                    years.map(y => (
                                        <tr key={y.id} className={`hover:bg-gray-50/50 transition-colors ${y.isCurrent ? 'bg-violet-50/30' : ''}`}>
                                            <td className="p-4 font-bold text-gray-900">{y.name}</td>
                                            <td className="p-4 text-gray-600">{y.startDate}</td>
                                            <td className="p-4 text-gray-600">{y.endDate}</td>
                                            <td className="p-4">
                                                {y.isCurrent ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> CURRENT
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-500">PAST/FUTURE</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!y.isCurrent && (
                                                    <button onClick={() => handleSetCurrent(y.id)} className="text-violet-600 hover:underline text-xs font-bold">
                                                        Set Current
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Holidays Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Holiday Calendar</h2>
                            <p className="text-sm text-gray-400 mt-0.5">These days will be excluded from attendance</p>
                        </div>
                        <button onClick={() => { setHForm(EMPTY_HOLIDAY); setHModal(true); }}
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            + Add Holiday
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Holiday Name</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-400">Loading...</td></tr>
                                ) : holidays.length === 0 ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-400">No holidays added.</td></tr>
                                ) : (
                                    holidays.map(h => (
                                        <tr key={h.id} className="hover:bg-gray-50/50">
                                            <td className="p-4 font-semibold text-gray-700">{h.date}</td>
                                            <td className="p-4 text-gray-900">{h.name}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteHoliday(h.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <Modal open={modal} onClose={() => setModal(false)} title="New Academic Year">
                    <form onSubmit={handleSaveYear} className="space-y-4">
                        <F label="Year Name (e.g. 2026-27)">
                            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="2026-27" />
                        </F>
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Start Date">
                                <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
                            </F>
                            <F label="End Date">
                                <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
                            </F>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={form.isCurrent} onChange={e => setForm({...form, isCurrent: e.target.checked})} className="rounded text-violet-600 focus:ring-violet-500" />
                            Set as current academic year
                        </label>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Year'}
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal open={hModal} onClose={() => setHModal(false)} title="Add Holiday">
                    <form onSubmit={handleSaveHoliday} className="space-y-4">
                        <F label="Holiday Date">
                            <Input type="date" value={hForm.date} onChange={e => setHForm({...hForm, date: e.target.value})} required />
                        </F>
                        <F label="Holiday Name">
                            <Input value={hForm.name} onChange={e => setHForm({...hForm, name: e.target.value})} required placeholder="Diwali, Christmas, etc." />
                        </F>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setHModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">
                                {saving ? 'Saving...' : 'Add Holiday'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </SchoolLayout>
    );
};

export default AcademicYear;
