import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../api/authApi';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

    const stepLabel = { 1: 'Email', 2: 'OTP', 3: 'Password' };

    return (
        <div className="min-h-screen w-full flex bg-[#FDFBF7]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
                .os-serif { font-family: 'Fraunces', Georgia, serif; }
                .os-sans { font-family: 'Inter', system-ui, sans-serif; }
                .os-orbit-outer { transform-origin: 150px 150px; animation: os-spin 26s linear infinite; }
                .os-orbit-inner { transform-origin: 150px 150px; animation: os-spin 15s linear infinite reverse; }
                @keyframes os-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (prefers-reduced-motion: reduce) {
                    .os-orbit-outer, .os-orbit-inner { animation: none; }
                }
            `}</style>

            {/* LEFT — brand / signature panel */}
            <div className="hidden lg:flex lg:w-[46%] bg-[#0B1120] relative flex-col justify-between px-14 py-12 overflow-hidden">
                <div className="os-sans text-[#C9A54E] text-sm tracking-[0.25em] uppercase">
                    OrgSphere
                </div>

                <div className="relative z-10">
                    <h1 className="os-serif text-white text-5xl leading-[1.15] max-w-md">
                        A short detour back to your account.
                    </h1>
                    <p className="os-sans text-slate-400 text-sm mt-5 max-w-sm leading-relaxed">
                        Verify it's you, then choose a new password — three quick steps
                        and you're back in.
                    </p>
                </div>

                <div className="absolute right-[-60px] bottom-[-60px] opacity-90">
                    <svg width="340" height="340" viewBox="0 0 300 300" fill="none">
                        <circle cx="150" cy="150" r="120" stroke="#1E293B" strokeWidth="1" />
                        <circle cx="150" cy="150" r="80" stroke="#1E293B" strokeWidth="1" />
                        <g className="os-orbit-outer">
                            <circle cx="270" cy="150" r="6" fill="#C9A54E" />
                        </g>
                        <g className="os-orbit-inner">
                            <circle cx="70" cy="150" r="5" fill="#64748B" />
                        </g>
                    </svg>
                </div>

                <div className="os-sans text-slate-600 text-xs relative z-10">
                    &copy; {new Date().getFullYear()} OrgSphere
                </div>
            </div>

            {/* RIGHT — form panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">

                    <h2 className="os-serif text-3xl text-[#0B1120] mb-1">Reset password</h2>
                    <p className="os-sans text-sm text-gray-500 mb-8">
                        Step {step} of 3 — {stepLabel[step]}
                    </p>

                    {/* Step indicator */}
                    <div className="flex items-center mb-9 os-sans">
                        {[1, 2, 3].map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                                            step >= s
                                                ? 'bg-[#0B1120] text-[#C9A54E]'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {s}
                                    </div>
                                    <span
                                        className={`text-[11px] tracking-wide ${
                                            step >= s ? 'text-[#0B1120]' : 'text-gray-400'
                                        }`}
                                    >
                                        {stepLabel[s]}
                                    </span>
                                </div>
                                {i < 2 && (
                                    <div
                                        className={`flex-1 h-px mx-2 -mt-5 transition-colors ${
                                            step > s ? 'bg-[#C9A54E]' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1 - Enter Email/Mobile */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="os-sans space-y-5">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Enter your registered email or mobile number and we'll send you an OTP.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Email or mobile
                                </label>
                                <input
                                    type="text"
                                    placeholder="you@company.com"
                                    value={emailOrMobile}
                                    onChange={(e) => setEmailOrMobile(e.target.value)}
                                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm transition-colors"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0B1120] hover:bg-[#161f36] text-white font-medium py-3 rounded-md transition duration-200 text-sm"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full text-center text-xs font-medium text-gray-500 hover:text-[#0B1120] transition"
                            >
                                Back to login
                            </button>
                        </form>
                    )}

                    {/* Step 2 - Enter OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="os-sans space-y-5">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                OTP sent to your registered email. Check your inbox and spam folder.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm tracking-[0.3em] transition-colors"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0B1120] hover:bg-[#161f36] text-white font-medium py-3 rounded-md transition duration-200 text-sm"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full text-center text-xs font-medium text-gray-500 hover:text-[#0B1120] transition"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3 - New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="os-sans space-y-5">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Choose a new password for your account.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    New password
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0B1120] hover:bg-[#161f36] text-white font-medium py-3 rounded-md transition duration-200 text-sm"
                            >
                                {loading ? 'Resetting...' : 'Reset password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;