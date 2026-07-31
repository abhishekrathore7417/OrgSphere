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
            // Backend se jo message aaya woh show karo (email ya masked email batata hai)
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
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Forgot Password</h2>

                {/* Step Indicator */}
                <div style={styles.stepRow}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={styles.stepItem}>
                            <div style={{
                                ...styles.stepCircle,
                                backgroundColor: step >= s ? '#4f46e5' : '#e5e7eb',
                                color: step >= s ? '#fff' : '#6b7280',
                            }}>
                                {s}
                            </div>
                            <span style={{ ...styles.stepLabel, color: step >= s ? '#4f46e5' : '#9ca3af' }}>
                                {s === 1 ? 'Email' : s === 2 ? 'OTP' : 'Password'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step 1 - Enter Email/Mobile */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={styles.form}>
                        <p style={styles.subtitle}>Enter your registered email or mobile number to receive an OTP.</p>
                        <label style={styles.label}>Email or Mobile</label>
                        <input
                            type="text"
                            placeholder="Enter email or mobile"
                            value={emailOrMobile}
                            onChange={(e) => setEmailOrMobile(e.target.value)}
                            style={styles.input}
                            autoFocus
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                        <button type="button" onClick={() => navigate('/login')} style={styles.linkButton}>
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Step 2 - Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={styles.form}>
                        <p style={styles.subtitle}>
                            OTP has been sent to your registered email address. Please check your inbox and spam folder.
                        </p>
                        <label style={styles.label}>Enter OTP</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            style={styles.input}
                            autoFocus
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={loading}
                            style={styles.linkButton}
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3 - New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={styles.form}>
                        <p style={styles.subtitle}>Set your new password.</p>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                            autoFocus
                        />
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        padding: '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '20px',
        textAlign: 'center',
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '14px',
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    stepRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '28px',
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
    },
    stepCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        transition: 'background-color 0.3s',
    },
    stepLabel: {
        fontSize: '12px',
        fontWeight: '500',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
    },
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    button: {
        marginTop: '8px',
        padding: '12px',
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#4f46e5',
        fontSize: '14px',
        cursor: 'pointer',
        textAlign: 'center',
        padding: '4px',
    },
};

export default ForgotPasswordPage;
