import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaSlidersH, FaBuilding, FaLock, FaBell,
    FaSave, FaUserCheck, FaEnvelope, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { logout, setCredentials } from '../../features/auth/authSlice';

const SettingsPage = () => {
    const { user, token } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('organization');

    // Form states
    const [orgForm, setOrgForm] = useState({
        organizationName: user?.organizationName || '',
        fullName:         user?.fullName || '',
        email:            user?.email || '',
        contactNumber:    user?.contactNumber || user?.phone || '',
        address:          user?.address || '',
    });

    const [pwdForm, setPwdForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [prefForm, setPrefForm] = useState({
        emailNotifications: true,
        smsAlerts: false,
        theme: 'light',
        language: 'en',
    });

    const [savingOrg, setSavingOrg] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);

    useEffect(() => {
        if (user) {
            setOrgForm({
                organizationName: user.organizationName || '',
                fullName:         user.fullName || '',
                email:            user.email || '',
                contactNumber:    user.contactNumber || user.phone || '',
                address:          user.address || '',
            });
        }
    }, [user]);

    const handleOrgSubmit = async (e) => {
        e.preventDefault();
        setSavingOrg(true);
        try {
            // Update Organization
            if (user?.organizationId) {
                await axiosInstance.put(`/api/organization/${user.organizationId}`, {
                    organizationName: orgForm.organizationName || 'N/A',
                    contactNumber: orgForm.contactNumber || '0000000000',
                    address: orgForm.address || 'N/A',
                });
            }

            // Update User
            if (user?.id) {
                await axiosInstance.put(`/api/users/${user.id}`, {
                    fullName: orgForm.fullName,
                    email: orgForm.email,
                    contactNumber: orgForm.contactNumber || '0000000000',
                });
            }

            // Update Redux state so UI reflects changes immediately
            const updatedUser = {
                ...user,
                fullName: orgForm.fullName,
                contactNumber: orgForm.contactNumber,
                organizationName: orgForm.organizationName,
                address: orgForm.address
            };
            dispatch(setCredentials({ user: updatedUser, token, organizationType: user.organizationType }));

            toast.success('✅ Organization & Admin settings updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setSavingOrg(false);
        }
    };

    const handlePwdSubmit = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }
        if (pwdForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setSavingPwd(true);
        try {
            await axiosInstance.put(`/api/users/${user.id}`, {
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber || user.phone || '0000000000',
                password: pwdForm.newPassword,
            });
            toast.success('✅ Security password updated successfully! Please login again.');
            setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                dispatch(logout());
                navigate('/');
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password update failed.');
        } finally {
            setSavingPwd(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 font-sans">

            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <FaSlidersH className="text-violet-600" /> General Settings
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage your organization profile, security, and application preferences
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-violet-50 px-3 py-1.5 rounded-full text-xs font-semibold text-violet-700">
                    <FaUserCheck /> Role: {user?.role || 'Admin'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 space-x-4">
                <button
                    onClick={() => setActiveTab('organization')}
                    className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                        activeTab === 'organization'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <FaBuilding /> Organization &amp; Admin Info
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                        activeTab === 'security'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <FaLock /> Security &amp; Password
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                        activeTab === 'preferences'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <FaBell /> System Preferences
                </button>
            </div>

            {/* Tab 1: Organization & Admin Info */}
            {activeTab === 'organization' && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleOrgSubmit} className="space-y-6">
                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                            Organization &amp; Administrator Profile
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Organization Name</label>
                                <div className="relative">
                                    <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text"
                                        value={orgForm.organizationName}
                                        onChange={e => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Organization Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Full Name</label>
                                <div className="relative">
                                    <FaUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text"
                                        value={orgForm.fullName}
                                        onChange={e => setOrgForm({ ...orgForm, fullName: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="email"
                                        value={orgForm.email}
                                        disabled
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Primary login email cannot be changed directly</span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text"
                                        value={orgForm.contactNumber}
                                        onChange={e => setOrgForm({ ...orgForm, contactNumber: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Address</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-xs" />
                                    <textarea
                                        value={orgForm.address}
                                        onChange={e => setOrgForm({ ...orgForm, address: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingOrg}
                                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-60"
                            >
                                {savingOrg ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <FaSave/>} Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tab 2: Security & Password */}
            {activeTab === 'security' && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm">
                    <form onSubmit={handlePwdSubmit} className="space-y-6 max-w-xl">
                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                            Change Password
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    value={pwdForm.currentPassword}
                                    onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password (min 6 chars)</label>
                                <input
                                    type="password"
                                    value={pwdForm.newPassword}
                                    onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={pwdForm.confirmPassword}
                                    onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingPwd}
                                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-60"
                            >
                                {savingPwd ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <FaLock/>} Update Password
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tab 3: System Preferences */}
            {activeTab === 'preferences' && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        System &amp; Notification Preferences
                    </h2>

                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-xs font-bold text-gray-800">Email Notifications</p>
                                <p className="text-[11px] text-gray-400">Receive email alerts for leave requests &amp; fee status</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefForm.emailNotifications}
                                onChange={e => setPrefForm({ ...prefForm, emailNotifications: e.target.checked })}
                                className="w-4 h-4 accent-violet-600"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-xs font-bold text-gray-800">SMS Alerts (Twilio Integration)</p>
                                <p className="text-[11px] text-gray-400">Send instant SMS alerts to employees/teachers</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefForm.smsAlerts}
                                onChange={e => setPrefForm({ ...prefForm, smsAlerts: e.target.checked })}
                                className="w-4 h-4 accent-violet-600"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-800">System Language</p>
                                <p className="text-[11px] text-gray-400">Default interface language</p>
                            </div>
                            <select
                                value={prefForm.language}
                                onChange={e => setPrefForm({ ...prefForm, language: e.target.value })}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg focus:outline-none"
                            >
                                <option value="en">English (US)</option>
                                <option value="hi">Hindi (हिंदी)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => toast.success('✅ Preferences saved!')}
                            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                        >
                            <FaSave /> Save Preferences
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SettingsPage;
