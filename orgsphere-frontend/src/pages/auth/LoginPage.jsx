import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaBuilding, FaSchool, FaEye, FaEyeSlash, FaPhone } from 'react-icons/fa';
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
            // ✅ Mobile number ko email ke format mein bhejo
            const response = await axiosInstance.post('/api/auth/login', {
                email: identifier,
                password
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

                dispatch(setCredentials({
                    user: userData,
                    token: data.token,
                    organizationType: data.organizationType,
                }));

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20">
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-white">OrgSphere</h1>
                    <p className="text-white/70 text-sm mt-1">Login to your account</p>
                </div>

                <div className="flex rounded-lg overflow-hidden border border-white/20 mb-4">
                    <button
                        onClick={() => setOrgType('company')}
                        className={`flex-1 py-2 text-sm font-medium transition flex items-center justify-center gap-2 ${
                            orgType === 'company'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                    >
                        <FaBuilding size={14} /> Company
                    </button>
                    <button
                        onClick={() => setOrgType('school')}
                        className={`flex-1 py-2 text-sm font-medium transition flex items-center justify-center gap-2 ${
                            orgType === 'school'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                    >
                        <FaSchool size={14} /> School
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 flex items-center gap-1">
                            <FaEnvelope size={14} />
                            <span className="text-xs text-white/30">|</span>
                            <FaPhone size={14} />
                        </div>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Email or Mobile Number"
                            className="w-full pl-20 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm text-white flex items-center justify-center gap-2 ${
                            orgType === 'company'
                                ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-white/70 text-xs">New to OrgSphere?</p>
                    <div className="flex justify-center gap-3 mt-1.5">
                        <Link to="/register/company" className="text-white/90 hover:text-white text-xs font-medium transition border border-white/20 px-3 py-1 rounded-full hover:bg-white/10">
                            Register Company
                        </Link>
                        <span className="text-white/30">|</span>
                        <Link to="/register/school" className="text-white/90 hover:text-white text-xs font-medium transition border border-white/20 px-3 py-1 rounded-full hover:bg-white/10">
                            Register School
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;