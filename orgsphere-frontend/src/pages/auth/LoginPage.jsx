import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FaGoogle, FaApple, FaFacebook, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { setCredentials } from '../../features/auth/authSlice';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orgType, setOrgType] = useState('company');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post('/api/auth/login', {
                email: identifier,
                password,
            });
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
                    organizationId: data.organizationId,
                };

                dispatch(
                    setCredentials({
                        user: userData,
                        token: data.token,
                        organizationType: data.organizationType,
                    })
                );

                toast.success('✅ Login successful!', { autoClose: 1000 });

                setTimeout(() => {
                    if (data.organizationType === 'COMPANY') {
                        navigate('/company/dashboard');
                    } else {
                        navigate('/school/dashboard');
                    }
                }, 500);
            } else {
                toast.error(data.message || 'Login failed', { autoClose: 1500 });
            }
        } catch (error) {
            toast.error('Invalid email or password', { autoClose: 1500 });
        } finally {
            setLoading(false);
        }
    };

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
                        One sphere for every organization you run.
                    </h1>
                    <p className="os-sans text-slate-400 text-sm mt-5 max-w-sm leading-relaxed">
                        Companies and schools, managed side by side — same account,
                        one clear line between them.
                    </p>
                </div>

                {/* Signature orbit graphic */}
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

                    {/* Org type tabs */}
                    <div className="flex gap-8 mb-10 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setOrgType('company')}
                            className={`os-sans pb-3 text-sm font-medium tracking-wide transition-colors relative ${
                                orgType === 'company' ? 'text-[#0B1120]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Company
                            {orgType === 'company' && (
                                <span className="absolute left-0 -bottom-px h-[2px] w-full bg-[#C9A54E]" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrgType('school')}
                            className={`os-sans pb-3 text-sm font-medium tracking-wide transition-colors relative ${
                                orgType === 'school' ? 'text-[#0B1120]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            School
                            {orgType === 'school' && (
                                <span className="absolute left-0 -bottom-px h-[2px] w-full bg-[#C9A54E]" />
                            )}
                        </button>
                    </div>

                    <h2 className="os-serif text-3xl text-[#0B1120] mb-1">Welcome back</h2>
                    <p className="os-sans text-sm text-gray-500 mb-8">
                        Sign in to your {orgType === 'company' ? 'company' : 'school'} workspace
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5 os-sans">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-0 py-2.5 pr-8 bg-transparent border-0 border-b border-gray-300 text-[#0B1120] placeholder-gray-400 focus:outline-none focus:border-[#C9A54E] text-sm transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1120] transition"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-xs font-medium text-gray-500 hover:text-[#0B1120] transition"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0B1120] hover:bg-[#161f36] text-white font-medium py-3 rounded-md transition duration-200 flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-7">
                        <hr className="flex-1 border-gray-200" />
                        <span className="os-sans text-[11px] text-gray-400 uppercase tracking-wider">or</span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center py-2.5 border border-gray-200 rounded-md text-gray-500 hover:border-gray-300 hover:text-[#0B1120] transition"
                        >
                            <FaGoogle size={15} />
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center py-2.5 border border-gray-200 rounded-md text-gray-500 hover:border-gray-300 hover:text-[#0B1120] transition"
                        >
                            <FaApple size={15} />
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center py-2.5 border border-gray-200 rounded-md text-gray-500 hover:border-gray-300 hover:text-[#0B1120] transition"
                        >
                            <FaFacebook size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;