import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FaBuilding, FaSchool, FaGoogle, FaApple, FaFacebook,
    FaEye, FaEyeSlash,
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
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{
                background:
                    'linear-gradient(135deg, #ddd0f5 0%, #cfe0f7 35%, #d9edf8 60%, #fbdbdb 100%)',
            }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-10 border border-gray-100">

                    {/* Company / School Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-violet-100 mb-6 bg-violet-50 p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => setOrgType('company')}
                            className={`flex-1 py-2.5 text-sm font-semibold transition-all rounded-lg flex items-center justify-center gap-2 ${
                                orgType === 'company'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'bg-transparent text-violet-700/60 hover:bg-violet-100'
                            }`}
                        >
                            <FaBuilding size={14} /> Company
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrgType('school')}
                            className={`flex-1 py-2.5 text-sm font-semibold transition-all rounded-lg flex items-center justify-center gap-2 ${
                                orgType === 'school'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'bg-transparent text-violet-700/60 hover:bg-violet-100'
                            }`}
                        >
                            <FaSchool size={14} /> School
                        </button>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Sign in to your {orgType === 'company' ? 'company' : 'school'} account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
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
                                    Logging in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* OR divider */}
                    <div className="flex items-center gap-3 my-6">
                        <hr className="flex-1 border-gray-200" />
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Or continue with</span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-violet-50 hover:border-violet-200 transition text-sm font-medium shadow-sm"
                        >
                            <FaGoogle className="text-red-500" /> Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-violet-50 hover:border-violet-200 transition text-sm font-medium shadow-sm"
                        >
                            <FaApple /> Apple
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-violet-50 hover:border-violet-200 transition text-sm font-medium shadow-sm"
                        >
                            <FaFacebook className="text-blue-600" /> Meta
                        </button>
                    </div>

                    {/* Forgot password link */}
                    <div className="text-center mt-6">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;