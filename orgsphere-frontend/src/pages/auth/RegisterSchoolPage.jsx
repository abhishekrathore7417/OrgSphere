import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaSchool, FaUser, FaEnvelope, FaLock, FaPhone,
    FaMapMarkerAlt, FaGraduationCap, FaUsers,
    FaEye, FaEyeSlash, FaCheckCircle,
} from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { paymentApi } from '../../api/paymentApi';

/* ── colours — same as RegisterCompanyPage ──────────────── */
const NAVY = '#1a2b3c';
const RED  = '#d62d20';

/* ── tiny icon helper ───────────────────────────────────── */
const Ic = ({ d, cls, sw = 2 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d={d} />
    </svg>
);
const IcClose = cls => <Ic cls={cls} d="M18 6L6 18M6 6l12 12" />;

/* ── Reusable field wrapper ─────────────────────────────── */
const Field = ({ icon, children }) => (
    <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>}
        {children}
    </div>
);
const inp = "w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition rounded";
const sel = "w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition rounded appearance-none";

/* ── Razorpay handler — same as company ─────────────────── */
const openRazorpay = (orderData, userData) => {
    return new Promise((resolve) => {
        const options = {
            key:         orderData.razorpayKeyId,
            amount:      Math.round(orderData.amount * 100),
            currency:    orderData.currency || 'INR',
            name:        'OrgSphere',
            description: `${orderData.planName} Plan`,
            order_id:    orderData.razorpayOrderId,
            prefill: {
                name:    userData.fullName,
                email:   userData.email,
                contact: userData.contactNumber,
                method:  'upi',
            },
            theme: { color: RED },
            handler: async (response) => {
                try {
                    await paymentApi.verifyPayment(
                        orderData.paymentId,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature,
                    );
                    toast.success('✅ Payment successful! Plan activated.');
                    resolve(true);
                } catch {
                    toast.error('Payment verification failed. Contact support.');
                    resolve(false);
                }
            },
            modal: { ondismiss: () => resolve(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    });
};

const RegisterSchoolPage = () => {
    const navigate     = useNavigate();
    const location     = useLocation();

    // Plan from HomePage modal
    const planFromHome = location.state?.plan || 'Free Trial';
    const isPaid       = planFromHome === 'Pro' || planFromHome === 'Annual';
    const planMap      = { 'Free Trial': 'FREE', 'Pro': 'MONTHLY', 'Annual': 'YEARLY' };
    const backendPlan  = planMap[planFromHome] || 'FREE';

    const [open,     setOpen]     = useState(true);
    const [formData, setFormData] = useState({
        organizationName: '', fullName: '', email: '',
        password: '', confirmPassword: '', contactNumber: '',
        address: '', schoolType: '', studentCount: '',
    });
    const [showPwd,  setShowPwd]  = useState(false);
    const [showCPwd, setShowCPwd] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [terms,    setTerms]    = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [open]);

    const ch = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

    const close = () => { setOpen(false); navigate('/'); };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!terms)                                         { toast.warn('Please accept the terms');     return; }
        if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match');     return; }
        if (formData.password.length < 6)                  { toast.error('Password min 6 characters'); return; }

        setLoading(true);
        try {
            const { confirmPassword, schoolType, studentCount, ...payload } = formData;
            const res      = await axiosInstance.post('/api/auth/register/school', payload);
            const authData = res.data?.data || res.data;

            if (!authData?.token) {
                toast.error(res.data?.message || 'Registration failed');
                setLoading(false);
                return;
            }

            toast.success('✅ School registered!', { autoClose: 1000 });

            // Paid plan — open Razorpay
            if (isPaid) {
                try {
                    const orderRes  = await paymentApi.createOrder(
                        backendPlan,
                        authData.organizationId,
                        authData.userId,
                    );
                    const orderData = orderRes.data?.data || orderRes.data;

                    if (!orderData?.razorpayOrderId) {
                        toast.error('Could not create payment order. Upgrade from dashboard.');
                        setTimeout(() => navigate('/login'), 800);
                        return;
                    }

                    const paid = await openRazorpay(orderData, {
                        fullName:      formData.fullName,
                        email:         formData.email,
                        contactNumber: formData.contactNumber,
                    });

                    if (!paid) {
                        toast.info('Registration done. You can upgrade from dashboard.');
                    }
                } catch (payErr) {
                    console.error('Payment order error:', payErr?.response?.data || payErr);
                    toast.warn(`Registered! Payment failed: ${payErr?.response?.data?.message || 'Try upgrading from dashboard.'}`);
                }
            }

            setTimeout(() => navigate('/login'), 800);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

            <div className="relative bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
                 style={{ borderTop: `4px solid ${RED}` }}>

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-black" style={{ color: NAVY }}>Register Your School</h2>
                            <p className="text-xs text-gray-500">Set up your school portal and start managing everything</p>
                        </div>
                    </div>
                    {/* Plan badge — same as company */}
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                              style={{ background: isPaid ? NAVY : '#fdf1f0', color: isPaid ? 'white' : RED }}>
                            {isPaid ? '💳' : '🆓'} {planFromHome}
                        </span>
                        <button onClick={close}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition rounded-full">
                            {IcClose('w-4 h-4')}
                        </button>
                    </div>
                </div>

                {/* Paid plan notice */}
                {isPaid && (
                    <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-xs font-medium"
                         style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', color: '#3730a3' }}>
                        💳 You selected <strong>{planFromHome}</strong> plan. After registration, Razorpay payment window will open to activate your plan.
                    </div>
                )}

                {/* Form */}
                <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Left */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">School Info</p>
                                <Field icon={<FaSchool size={13}/>}>
                                    <input name="organizationName" placeholder="School Name *" value={formData.organizationName} onChange={ch} className={inp} required />
                                </Field>
                                <Field icon={<FaUser size={13}/>}>
                                    <input name="fullName" placeholder="Admin Full Name *" value={formData.fullName} onChange={ch} className={inp} required />
                                </Field>
                                <Field icon={<FaEnvelope size={13}/>}>
                                    <input name="email" type="email" placeholder="Email Address *" value={formData.email} onChange={ch} className={inp} required />
                                </Field>
                                <Field icon={<FaLock size={13}/>}>
                                    <input type={showPwd ? 'text' : 'password'} name="password" placeholder="Password * (min 6)" value={formData.password} onChange={ch} className={inp} required />
                                    <button type="button" onClick={() => setShowPwd(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition" tabIndex={-1}>
                                        {showPwd ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                    </button>
                                </Field>
                                <Field icon={<FaLock size={13}/>}>
                                    <input type={showCPwd ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={ch} className={inp} required />
                                    <button type="button" onClick={() => setShowCPwd(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition" tabIndex={-1}>
                                        {showCPwd ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                                    </button>
                                </Field>
                            </div>

                            {/* Right */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact & Address</p>
                                <Field icon={<FaPhone size={13}/>}>
                                    <input name="contactNumber" placeholder="Contact Number *" value={formData.contactNumber} onChange={ch} className={inp} required />
                                </Field>
                                <Field icon={<FaMapMarkerAlt size={13}/>}>
                                    <textarea name="address" placeholder="Full Address *" value={formData.address} onChange={ch}
                                              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition rounded resize-none"
                                              rows={3} required />
                                </Field>
                                <div className="grid grid-cols-2 gap-2">
                                    <Field icon={<FaGraduationCap size={13}/>}>
                                        <select name="schoolType" value={formData.schoolType} onChange={ch} className={sel}>
                                            <option value="">School Type (optional)</option>
                                            {['Primary','Secondary','Senior Secondary','Higher Secondary','College','University','Coaching','Other'].map(o =>
                                                <option key={o} value={o}>{o}</option>
                                            )}
                                        </select>
                                    </Field>
                                    <Field icon={<FaUsers size={13}/>}>
                                        <select name="studentCount" value={formData.studentCount} onChange={ch} className={sel}>
                                            <option value="">Students (optional)</option>
                                            {['1-50','51-200','201-500','501-1000','1001-3000','3000+'].map(o =>
                                                <option key={o} value={o}>{o}</option>
                                            )}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2.5 pt-1">
                            <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)}
                                   className="mt-0.5 w-4 h-4 accent-red-600" />
                            <label htmlFor="terms" className="text-xs text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="font-semibold hover:underline" style={{ color: RED }}>Terms &amp; Conditions</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="font-semibold hover:underline" style={{ color: RED }}>Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                                className="w-full text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                                style={{ background: RED }}>
                            {loading ? (
                                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg> {isPaid ? 'Registering & Opening Payment...' : 'Registering...'}</>
                            ) : (
                                <><FaCheckCircle /> {isPaid ? `Register & Pay (${planFromHome})` : 'Register School'}</>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-500 pb-1">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold hover:underline" style={{ color: RED }}>Sign In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterSchoolPage;
