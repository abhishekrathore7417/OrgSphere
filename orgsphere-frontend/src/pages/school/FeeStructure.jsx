import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { schoolApi } from '../../api/schoolApi';
import SchoolLayout from '../../components/layout/SchoolLayout';
import Modal from '../../components/ui/Modal';

const F = ({ label, children }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>;
const Input = (props) => <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />;
const Select = ({ children, ...props }) => <select {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">{children}</select>;

const FREQ_LABEL = { MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', YEARLY: 'Yearly', ONE_TIME: 'One Time' };
const FREQ_COLOR = { MONTHLY: 'bg-violet-50 text-violet-600', QUARTERLY: 'bg-blue-50 text-blue-600', YEARLY: 'bg-green-50 text-green-600', ONE_TIME: 'bg-amber-50 text-amber-600' };
const TYPE_LABEL = { SCHOOL: 'School Fee', TRANSPORT: 'Transport Fee', EXAM: 'Exam Fee', LIBRARY: 'Library Fee', SPORTS: 'Sports Fee', OTHER: 'Other' };

/* ── Helper: compute due date from frequency + dueDay ── */
function computeDueDate(frequency, dueDay, refDate = new Date()) {
    const d = parseInt(dueDay, 10) || 10;
    const now = new Date(refDate);
    if (frequency === 'MONTHLY') {
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (frequency === 'QUARTERLY') {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        return `${now.getFullYear()}-${String(qMonth + 3).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (frequency === 'YEARLY') {
        return `${now.getFullYear()}-12-${String(d).padStart(2, '0')}`;
    }
    // ONE_TIME — today + 30 days
    const oneTime = new Date();
    oneTime.setDate(oneTime.getDate() + 30);
    return oneTime.toISOString().split('T')[0];
}

const FeeStructure = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId = localStorage.getItem('organizationId');
    const orgId = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const EMPTY = { feeType: 'SCHOOL', amount: '', frequency: 'MONTHLY', dueDay: 10, description: '' };

    const [structures,   setStructures]   = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [generating,   setGenerating]   = useState(false);
    const [modal,        setModal]        = useState(false);
    const [genModal,     setGenModal]     = useState(false);
    const [editingId,    setEditingId]    = useState(null);
    const [form,         setForm]         = useState(EMPTY);
    const [genResult,    setGenResult]    = useState(null); // { created, skipped, failed }
    const [genMonth,     setGenMonth]     = useState(() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => { loadData(); }, [orgId]);

    const loadData = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const res = await schoolApi.getFeeStructuresByOrganization(orgId);
            setStructures(res.data.data || []);
        } catch { toast.error('Failed to load fee structures'); }
        finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = { ...form, organizationId: orgId, amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay, 10) };
            if (editingId) {
                await schoolApi.updateFeeStructure(editingId, data);
                toast.success('Fee structure updated');
            } else {
                await schoolApi.createFeeStructure(data);
                toast.success('Fee structure created');
            }
            setModal(false);
            loadData();
        } catch { toast.error('Failed to save fee structure'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this fee structure?')) return;
        try {
            await schoolApi.deleteFeeStructure(id);
            toast.success('Deleted');
            loadData();
        } catch { toast.error('Failed to delete'); }
    };

    /* ── Auto Generate Fees ─────────────────────────────────── */
    const handleGenerateFees = async () => {
        if (structures.length === 0) { toast.warn('No fee structures defined. Add structures first.'); return; }
        setGenerating(true);
        setGenResult(null);
        let created = 0, skipped = 0, failed = 0;
        try {
            // 1. Fetch all students
            const stuRes = await schoolApi.getStudentsByOrganization(orgId);
            const students = stuRes.data.data || [];

            if (students.length === 0) {
                toast.warn('No students found in this school.');
                setGenerating(false);
                return;
            }

            // 2. Fetch existing fees to avoid duplicates
            const existRes = await schoolApi.getFeesByOrganization(orgId);
            const existingFees = existRes.data.data || [];

            // Compute reference date from selected month
            const [yr, mo] = genMonth.split('-').map(Number);
            const refDate  = new Date(yr, mo - 1, 1);

            // 3. For each structure × each student — create fee if not exists
            const tasks = [];
            for (const struct of structures) {
                const dueDate = computeDueDate(struct.frequency, struct.dueDay, refDate);
                const isMandatory = ['SCHOOL', 'EXAM'].includes(struct.feeType);

                for (const student of students) {
                    if (!isMandatory) {
                        const optedStr = student.optionalFeeTypes || '';
                        const optedArr = optedStr.split(',').map(s => s.trim());
                        if (!optedArr.includes(struct.feeType)) {
                            skipped++;
                            continue;
                        }
                    }
                    // studentId field in fee = student.userId (per backend mapping)
                    const studentUserId = student.userId;

                    // Check duplicate: same student + same feeType + same dueDate
                    const alreadyExists = existingFees.some(f =>
                        f.studentId === studentUserId &&
                        f.feeType   === struct.feeType &&
                        f.dueDate   === dueDate
                    );

                    if (alreadyExists) { skipped++; continue; }

                    tasks.push(
                        schoolApi.createFee({
                            feeType:        struct.feeType,
                            amount:         struct.amount,
                            dueDate:        dueDate,
                            description:    struct.description || `${TYPE_LABEL[struct.feeType] || struct.feeType} — ${FREQ_LABEL[struct.frequency] || struct.frequency}`,
                            studentId:      studentUserId,
                            organizationId: parseInt(orgId),
                        }).then(() => { created++; }).catch(() => { failed++; })
                    );
                }
            }

            await Promise.all(tasks);
            setGenResult({ created, skipped, failed, students: students.length, structures: structures.length });

        } catch (err) {
            toast.error('Generation failed: ' + (err?.response?.data?.message || err.message));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <SchoolLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Fee Structure</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Define standard fees — then auto-generate for all students</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Generate Fees button */}
                        <button
                            onClick={() => { setGenResult(null); setGenModal(true); }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Generate Fees
                        </button>
                        <button
                            onClick={() => { setEditingId(null); setForm(EMPTY); setModal(true); }}
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-violet-700 transition-colors"
                        >
                            + Add Structure
                        </button>
                    </div>
                </div>

                {/* Info banner */}
                {structures.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs text-blue-700 font-medium">
                            Click <strong>Generate Fees</strong> to automatically create fee records for all students based on these structures. Duplicate fees (same student + type + due date) will be skipped automatically.
                        </p>
                    </div>
                )}

                {/* Structure table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Frequency</th>
                                    <th className="p-4">Due Day</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
                                ) : structures.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center">
                                        <p className="text-sm font-medium text-gray-500">No fee structures defined</p>
                                        <p className="text-xs text-gray-400 mt-1">Add structures first, then generate fees for all students</p>
                                    </td></tr>
                                ) : (
                                    structures.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-semibold text-gray-800">{TYPE_LABEL[s.feeType] || s.feeType}</td>
                                            <td className="p-4 font-bold text-gray-900">₹{s.amount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${FREQ_COLOR[s.frequency] || 'bg-gray-50 text-gray-600'}`}>
                                                    {FREQ_LABEL[s.frequency] || s.frequency}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">Day {s.dueDay} of month</td>
                                            <td className="p-4 text-gray-500 truncate max-w-xs">{s.description || '—'}</td>
                                            <td className="p-4 text-right flex items-center justify-end gap-3">
                                                <button onClick={() => { setEditingId(s.id); setForm(s); setModal(true); }} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Add/Edit Modal ── */}
                <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Edit Fee Structure' : 'New Fee Structure'}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <F label="Fee Type">
                            <Select value={form.feeType} onChange={e => setForm({...form, feeType: e.target.value})} required>
                                <option value="SCHOOL">School Fee</option>
                                <option value="TRANSPORT">Transport Fee</option>
                                <option value="EXAM">Exam Fee</option>
                                <option value="LIBRARY">Library Fee</option>
                                <option value="SPORTS">Sports Fee</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </F>
                        <F label="Amount (₹)">
                            <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        </F>
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Frequency">
                                <Select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} required>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="YEARLY">Yearly</option>
                                    <option value="ONE_TIME">One Time</option>
                                </Select>
                            </F>
                            <F label="Due Day (1-28)">
                                <Input type="number" min="1" max="28" value={form.dueDay} onChange={e => setForm({...form, dueDay: e.target.value})} required />
                            </F>
                        </div>
                        <F label="Description">
                            <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
                        </F>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Structure'}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* ── Generate Fees Modal ── */}
                <Modal open={genModal} onClose={() => { if (!generating) setGenModal(false); }} title="Generate Fees for All Students">
                    <div className="space-y-5">
                        {!genResult ? (
                            <>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-700">What will happen?</p>
                                    <ul className="text-xs text-gray-500 space-y-1.5">
                                        {structures.map(s => (
                                            <li key={s.id} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                                                <span>{TYPE_LABEL[s.feeType] || s.feeType} — ₹{s.amount.toLocaleString()} ({FREQ_LABEL[s.frequency]}, due day {s.dueDay})</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs text-gray-400 pt-1">These fees will be generated for every student. Already existing fees (same type + due date) will be skipped.</p>
                                </div>

                                <F label="For Month">
                                    <Input
                                        type="month"
                                        value={genMonth}
                                        onChange={e => setGenMonth(e.target.value)}
                                    />
                                </F>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setGenModal(false)} disabled={generating} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                    <button
                                        onClick={handleGenerateFees}
                                        disabled={generating || structures.length === 0}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {generating ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                                        ) : (
                                            <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Generate Now</>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Result screen */
                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className="text-base font-bold text-gray-800">Generation Complete!</p>
                                    <p className="text-xs text-gray-400 mt-1">{genResult.structures} structures × {genResult.students} students</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-green-700">{genResult.created}</p>
                                        <p className="text-xs font-medium text-green-600 mt-1">Created</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-amber-600">{genResult.skipped}</p>
                                        <p className="text-xs font-medium text-amber-500 mt-1">Skipped</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-red-600">{genResult.failed}</p>
                                        <p className="text-xs font-medium text-red-500 mt-1">Failed</p>
                                    </div>
                                </div>
                                {genResult.skipped > 0 && (
                                    <p className="text-xs text-gray-400 text-center">Skipped fees already existed for this period.</p>
                                )}
                                <button
                                    onClick={() => setGenModal(false)}
                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold py-2.5 rounded-lg"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </SchoolLayout>
    );
};

export default FeeStructure;
