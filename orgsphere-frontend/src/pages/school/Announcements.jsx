import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;
const Textarea = (props) => <textarea {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" rows={4} />;

const Announcements = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId = localStorage.getItem('organizationId');
    const orgId = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const EMPTY = { title: '', body: '', priority: 'NORMAL' };
    
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);

    useEffect(() => { loadData(); }, [orgId]);

    const loadData = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const res = await schoolApi.getAnnouncementsByOrganization(orgId);
            setAnnouncements(res.data.data || []);
        } catch (e) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await schoolApi.createAnnouncement({ ...form, organizationId: orgId });
            toast.success('Announcement posted');
            setModal(false);
            loadData();
        } catch (e) {
            toast.error('Failed to post announcement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await schoolApi.deleteAnnouncement(id);
            toast.success('Deleted');
            loadData();
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Notice Board</h2>
                        <p className="text-sm text-gray-400 mt-0.5">School-wide announcements for students and teachers</p>
                    </div>
                    <button onClick={() => { setForm(EMPTY); setModal(true); }}
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-violet-700 transition-colors">
                        + Post Notice
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                        <p className="font-medium">No active announcements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map(a => (
                            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                                <div className={`h-1.5 ${a.priority === 'HIGH' ? 'bg-red-500' : 'bg-violet-500'}`} />
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-2 gap-3">
                                        <h3 className="font-bold text-gray-900 leading-tight">{a.title}</h3>
                                        {a.priority === 'HIGH' && (
                                            <span className="shrink-0 inline-flex px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 tracking-widest">HIGH</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4 font-medium">
                                        Posted: {new Date(a.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap flex-1">{a.body}</p>
                                    
                                    <div className="pt-4 mt-4 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(a.id)} className="text-xs font-bold text-red-500 hover:underline">
                                            Delete Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Modal open={modal} onClose={() => setModal(false)} title="Post Announcement">
                    <form onSubmit={handleSave} className="space-y-4">
                        <F label="Title">
                            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Notice subject..." />
                        </F>
                        <F label="Message Body">
                            <Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} required placeholder="Write the announcement details here..." />
                        </F>
                        <F label="Priority">
                            <Select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} required>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High (Urgent)</option>
                            </Select>
                        </F>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">
                                {saving ? 'Posting...' : 'Post Notice'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </SchoolLayout>
    );
};

export default Announcements;
