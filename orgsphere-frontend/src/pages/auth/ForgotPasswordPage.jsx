import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { authApi } from '../../api/authApi';

/* ── colours — same as login/register ──────────────────── */
const NAVY = '#1a2b3c';
const RED  = '#d62d20';

/* ── tiny SVG helper ────────────────────────────────────── */
const Ic = ({ d, cls, sw = 2 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
        strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d={d} />
    </svg>
);
const IcClose  = cls => <Ic cls={cls} d="M18 6L6 18M6 6l12 12" />;
const IcBack   = cls => <Ic cls={cls} sw={2.5} d="M19 12H5M12 5l-7 7 7 7" />;
const IcArrow  = cls => <Ic cls={cls} sw={2.5} d="M5 12h14M13 6l6 6-6 6" />;

/* ── Step indicator ─────────────────────────────────────── */
const Steps = ({ current }) => {
    const steps = [
        { n: 1, label: 'Email'    },
        { n: 2, label: 'OTP'      },
        { n: 3, label: 'Password' },
    ];
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                            current >= s.n
                                ? 'text-white'
                                : 'bg-slate-100 text-slate-400'
                        }`} style={ current >= s.n ? { background: RED } : {} }>
                            {s.n}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1.5 ${current >= s.n ? 'text-red-600' : 'text-slate-400'}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mb-5 mx-1 transition-all ${current > s.n ? '' : 'bg-slate-200'}`}
                            style={ current > s.n ? { background: RED } : {} } />
                    )}
                </div>
            ))}
        </div>
    );
};

/* ── Loading spinner ────────────────────────────────────── */
const Spinner = () => (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
);

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    const [step,            setStep]            = useState(1);
    const [emailOrMobile,   setEmailOrMobile]   = useState('');
    const [otp,             setOtp]             = useState('');
    const [newPassword,     setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew,         setShowNew]         = useState(false);
    const [showConfirm,     setShowConfirm]     = useState(false);
    const [loading,         setLoading]         = useState(false);

    /* lock body scroll */
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [open]);

    const close = () => {
        setOpen(false);
        navigate('/');
    };

    /* Step 1 — Send OTP */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!emailOrMobile.trim()) { toast.error('Please enter your email or mobile'); return; }
        setLoading(true);
        try {
            const res = await authApi.forgotPassword(emailOrMobile.trim());
            toast.success(res?.data || 'OTP sent to your registered email!');
            setStep(2);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.response?.data || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    /* Step 2 — Verify OTP */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) { toast.error('Please enter the OTP'); return; }
        setLoading(true);
        try {
            await authApi.verifyOtp(emailOrMobile.trim(), otp.trim());
            toast.success('OTP verified!');
            setStep(3);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.response?.data || 'Invalid or expired OTP');
        } finally { setLoading(false); }
    };

    /* Step 3 — Reset Password */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword.trim() || !confirmPassword.trim()) { toast.error('Please fill in all fields'); return; }
        if (newPassword !== confirmPassword)                  { toast.error('Passwords do not match');   return; }
        if (newPassword.length < 6)                          { toast.error('Password min 6 characters');return; }
        setLoading(true);
        try {
            await authApi.resetPassword(emailOrMobile.trim(), otp.trim(), newPassword);
            toast.success('Password reset successfully! Please sign in.');
            setOpen(false);
            navigate('/login');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.response?.data || 'Failed to reset password');
        } finally { setLoading(false); }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

            {/* Modal — same exact style as register */}
            <div className="relative bg-white w-full max-w-md shadow-2xl"
                style={{ borderTop: `4px solid ${RED}` }}>

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-black" style={{ color: NAVY }}>Reset Your Password</h2>
                            <p className="text-xs text-gray-500">Follow the steps to regain access</p>
                        </div>
                    </div>
                    <button onClick={close}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition rounded-full">
                        {IcClose('w-4 h-4')}
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <Steps current={step} />

                    {/* ─ Step 1: Email / Mobile ─ */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed -mt-2 mb-4">
                                Enter your registered email address or mobile number to receive a One-Time Password.
                            </p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <FaEnvelope size={13}/>
                                </span>
                                <input
                                    type="text"
                                    value={emailOrMobile}
                                    onChange={e => setEmailOrMobile(e.target.value)}
                                    placeholder="Email or Mobile Number *"
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition rounded"
                                    style={{ '--tw-ring-color': RED }}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60 rounded"
                                style={{ background: RED }}>
                                {loading ? <><Spinner /> Sending OTP...</> : <>{IcArrow('w-4 h-4')} Send OTP</>}
                            </button>
                            <p className="text-center text-xs text-gray-500">
                                Remember your password?{' '}
                                <Link to="/login" className="font-bold hover:underline" style={{ color: RED }}>Sign In</Link>
                            </p>
                        </form>
                    )}

                    {/* ─ Step 2: OTP ─ */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 -mt-2 mb-4">
                                <p className="text-xs text-green-700 font-medium">
                                    OTP sent to your registered email. Check your inbox and spam folder.
                                </p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <FaKey size={13}/>
                                </span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 6-digit OTP *"
                                    maxLength={6}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition rounded tracking-widest"
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60 rounded"
                                style={{ background: RED }}>
                                {loading ? <><Spinner /> Verifying...</> : <>{IcArrow('w-4 h-4')} Verify OTP</>}
                            </button>
                            <div className="flex items-center justify-between text-xs">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-semibold">
                                    {IcBack('w-3.5 h-3.5')} Change Email
                                </button>
                                <button type="button" onClick={handleSendOtp} disabled={loading}
                                    className="font-bold hover:underline disabled:opacity-50" style={{ color: RED }}>
                                    Resend OTP
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ─ Step 3: New Password ─ */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed -mt-2 mb-4">
                                Create a strong new password for your account.
                            </p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <FaLock size={13}/>
                                </span>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="New Password * (min 6)"
                                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition rounded"
                                    autoFocus
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition" tabIndex={-1}>
                                    {showNew ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <FaLock size={13}/>
                                </span>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm New Password *"
                                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition rounded"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition" tabIndex={-1}>
                                    {showConfirm ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                </button>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60 rounded"
                                style={{ background: RED }}>
                                {loading ? <><Spinner /> Resetting...</> : <>{IcArrow('w-4 h-4')} Reset Password</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
