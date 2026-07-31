import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaSchool } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { setCredentials } from '../../features/auth/authSlice';

const LoginPopup = ({ isOpen, onClose }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orgType, setOrgType] = useState('company');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    if (!isOpen) return null;

    // ✅ Login Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post('/api/auth/login', { email: identifier, password });
            const data = response.data;

            if (data.token) {
                if (orgType === 'company' && data.organizationType === 'SCHOOL') {
                    toast.error('This email is registered as SCHOOL', { autoClose: 1500 });
                    setLoading(false);
                    return;
                }
                if (orgType === 'school' && data.organizationType === 'COMPANY') {
                    toast.error('This email is registered as COMPANY', { autoClose: 1500 });
                    setLoading(false);
                    return;
                }

                const userData = {
                    id: data.userId,
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role,
                    organizationType: data.organizationType,
                    organizationName: data.organizationName,
                    organizationId: data.organizationId
                };

                dispatch(setCredentials({
                    user: userData,
                    token: data.token,
                    organizationType: data.organizationType,
                }));

                toast.success('✅ Login successful!', { autoClose: 1000 });
                onClose();

                setTimeout(() => {
                    if (data.organizationType === 'COMPANY') {
                        navigate('/company/dashboard');
                    } else {
                        navigate('/school/dashboard');
                    }
                }, 500);
            } else {
                toast.error('Invalid credentials', { autoClose: 1500 });
            }
        } catch (error) {
            toast.error('Invalid email or password', { autoClose: 1500 });
        } finally {
            setLoading(false);
        }
    };

    // ✅ Forgot Password - Send OTP
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetLoading(true);

        try {
            await axiosInstance.post('/api/auth/forgot-password', null, {
                params: { emailOrMobile: resetEmail }
            });

            toast.success('✅ OTP sent successfully!', { autoClose: 1500 });
            setShowOtpScreen(true);
            setShowForgotPassword(false);
        } catch (error) {
            toast.error(error.response?.data || 'User not found', { autoClose: 1500 });
        } finally {
            setResetLoading(false);
        }
    };

    // ✅ Verify OTP and Reset Password
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpLoading(true);

        try {
            await axiosInstance.post('/api/auth/reset-password', null, {
                params: {
                    emailOrMobile: resetEmail,
                    otp: otp,
                    newPassword: newPassword
                }
            });

            toast.success('✅ Password reset successfully!', { autoClose: 1500 });
            setShowOtpScreen(false);
            setResetEmail('');
            setOtp('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data || 'Invalid OTP or password', { autoClose: 1500 });
        } finally {
            setOtpLoading(false);
        }
    };

    // ============ LOGIN FORM ============
    if (!showForgotPassword && !showOtpScreen) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-white/20 animate-fadeIn">

                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                        <FaTimes size={20} />
                    </button>

                    <div className="text-center mb-6">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OrgSphere</span>
                        <h2 className="text-xl font-bold text-gray-800 mt-2">Welcome Back!</h2>
                        <p className="text-gray-500 text-sm">Login to your account to continue</p>
                    </div>

                    <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
                        <button onClick={() => setOrgType('company')} className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${orgType === 'company' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <FaBuilding size={16} /> Company
                        </button>
                        <button onClick={() => setOrgType('school')} className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${orgType === 'school' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <FaSchool size={16} /> School
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Mobile Number</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter your email or mobile number" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2 text-white ${orgType === 'company' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'}`}>
                            {loading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Logging in...</> : `Sign In as ${orgType === 'company' ? 'Company' : 'School'}`}
                        </button>

                        <div className="text-center">
                            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                                Forgot your password?
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Don't have an account? <button onClick={onClose} className="text-blue-600 hover:underline font-medium">Register here</button></p>
                    </div>
                </div>
            </div>
        );
    }

    // ============ FORGOT PASSWORD - SEND OTP ============
    if (showForgotPassword && !showOtpScreen) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-white/20 animate-fadeIn">

                    <button onClick={() => setShowForgotPassword(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                        <FaTimes size={20} />
                    </button>

                    <div className="text-center mb-6">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OrgSphere</span>
                        <h2 className="text-xl font-bold text-gray-800 mt-2">Forgot Password</h2>
                        <p className="text-gray-500 text-sm">Enter your email/mobile to receive OTP</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Mobile Number</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email or mobile number" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" required />
                            </div>
                        </div>

                        <button type="submit" disabled={resetLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2">
                            {resetLoading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</> : 'Send OTP'}
                        </button>

                        <div className="text-center">
                            <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Back to Login</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ============ OTP VERIFICATION & RESET PASSWORD ============
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-white/20 animate-fadeIn">

                <button onClick={() => setShowOtpScreen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                    <FaTimes size={20} />
                </button>

                <div className="text-center mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OrgSphere</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Reset Password</h2>
                    <p className="text-gray-500 text-sm">Enter OTP and new password</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" required />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={otpLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2">
                        {otpLoading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Resetting...</> : 'Reset Password'}
                    </button>

                    <div className="text-center">
                        <button type="button" onClick={() => setShowOtpScreen(false)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Back to Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPopup;