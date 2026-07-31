import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaBuilding, FaSchool } from 'react-icons/fa';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [orgType, setOrgType] = useState('company');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authApi.login(email, password);
            const data = response.data;

            if (data.success) {
                const userData = {
                    id: data.data.userId,
                    fullName: data.data.fullName,
                    email: data.data.email,
                    role: data.data.role,
                    organizationType: data.data.organizationType,
                    organizationName: data.data.organizationName,
                };

                dispatch(setCredentials({
                    user: userData,
                    token: data.data.token,
                    organizationType: data.data.organizationType,
                }));

                toast.success('Login successful!');

                if (data.data.organizationType === 'COMPANY') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/school/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20">
                {/* Logo */}
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-white">OrgSphere</h1>
                    <p className="text-white/70 text-sm mt-1">Login to your account</p>
                </div>

                {/* Organization Type Selector */}
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
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
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