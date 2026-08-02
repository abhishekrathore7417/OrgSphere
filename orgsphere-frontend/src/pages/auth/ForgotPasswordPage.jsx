import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../api/authApi';

// Step 1: Enter email/mobile
// Step 2: Enter OTP received on email
// Step 3: Enter new password

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1 - Send OTP
    const handleSendOtp = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!emailOrMobile.trim()) {
            toast.error('Please enter your email or mobile number');
            return;
        }
        setLoading(true);
        try {
            const response = await authApi.forgotPassword(emailOrMobile.trim());
            const msg = response?.data || 'OTP sent to your registered email!';
            toast.success(msg);
            setStep(2);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to send OTP. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 2 - Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast.error('Please enter the OTP');
            return;
        }
        setLoading(true);
        try {
            await authApi.verifyOtp(emailOrMobile.trim(), otp.trim());
            toast.success('OTP verified successfully!');
            setStep(3);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Invalid or expired OTP.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 3 - Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword.trim() || !confirmPassword.trim()) {
            toast.error('Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authApi.resetPassword(emailOrMobile.trim(), otp.trim(), newPassword);
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to reset password.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{
                background:
                    'linear-gradient(135deg, #ddd0f5 0%, #cfe0f7 35%, #d9edf8 60%, #fbdbdb 100%)',
            }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-10 border border-gray-100">

                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-6">
                        Forgot Password
                    </h2>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-6 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                        step >= s
                                            ? 'bg-violet-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {s}
                                </div>
                                <span
                                    className={`text-xs font-medium ${
                                        step >= s ? 'text-violet-600' : 'text-gray-400'
                                    }`}
                                >
                                    {s === 1 ? 'Email' : s === 2 ? 'OTP' : 'Password'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1 - Enter Email/Mobile */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                            <p className="text-sm text-gray-500 leading-relaxed mb-1">
                                Enter your registered email or mobile number to receive an OTP.
                            </p>
                            <label className="text-sm font-semibold text-gray-700">Email or Mobile</label>
                            <input
                                type="text"
                                placeholder="Enter email or mobile"
                                value={emailOrMobile}
                                onChange={(e) => setEmailOrMobile(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-center text-sm font-semibold text-violet-600 hover:text-violet-800 transition py-1"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    {/* Step 2 - Enter OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                            <p className="text-sm text-gray-500 leading-relaxed mb-1">
                                OTP has been sent to your registered email address. Please check your inbox and spam folder.
                            </p>
                            <label className="text-sm font-semibold text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-center text-sm font-semibold text-violet-600 hover:text-violet-800 transition py-1"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3 - New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                            <p className="text-sm text-gray-500 leading-relaxed mb-1">
                                Set your new password.
                            </p>
                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                                autoFocus
                            />
                            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;