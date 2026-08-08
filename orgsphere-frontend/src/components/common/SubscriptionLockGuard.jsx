import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { subscriptionApi } from '../../api/subscriptionApi';
import { FaLock, FaCrown, FaArrowRight } from 'react-icons/fa';

const SubscriptionLockGuard = ({ children }) => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [loading, setLoading]     = useState(true);
    const [isExpired, setIsExpired] = useState(false);
    const [subData, setSubData]     = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!orgId) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        subscriptionApi.getByOrganization(orgId)
            .then(res => {
                if (!isMounted) return;
                const data = res.data?.data || res.data;
                setSubData(data);

                const today = new Date().toISOString().split('T')[0];
                const expired = data?.status === 'EXPIRED' || (data?.endDate && data.endDate < today);
                setIsExpired(expired);
            })
            .catch(() => {
                if (isMounted) setIsExpired(false);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [orgId, location.pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-medium">Checking subscription status...</p>
                </div>
            </div>
        );
    }

    if (isExpired) {
        const isSchool = location.pathname.startsWith('/school');
        const upgradeRoute = isSchool ? '/school/subscription' : '/company/subscription';

        return (
            <div className="p-6 md:p-12 max-w-4xl mx-auto">
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 md:p-12 text-center overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-100 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-60" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 text-3xl shadow-inner mb-6">
                            <FaLock />
                        </div>

                        <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-4">
                            Subscription Required
                        </span>

                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                            Trial Expired / Feature Locked
                        </h2>

                        <p className="text-sm text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
                            Your 7-day free trial or current subscription plan for{' '}
                            <strong>{user?.organizationName || 'your organization'}</strong> has expired on{' '}
                            <span className="font-semibold text-gray-800">{subData?.endDate || 'recently'}</span>.
                            Please renew or upgrade your plan to unlock all features.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                            <button
                                onClick={() => navigate(upgradeRoute)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 text-sm flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
                            >
                                <FaCrown /> Renew / Upgrade Plan <FaArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default SubscriptionLockGuard;
