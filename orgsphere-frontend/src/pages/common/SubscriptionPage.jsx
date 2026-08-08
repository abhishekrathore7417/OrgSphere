import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FaCrown, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle,
    FaRegClock, FaRocket, FaShieldAlt, FaSyncAlt, FaFileInvoiceDollar, FaDownload
} from 'react-icons/fa';
import { subscriptionApi } from '../../api/subscriptionApi';
import { paymentApi } from '../../api/paymentApi';

const openRazorpay = (orderData, userData) => {
    return new Promise((resolve) => {
        const options = {
            key:         orderData.razorpayKeyId,
            amount:      Math.round(orderData.amount * 100),
            currency:    orderData.currency || 'INR',
            name:        'OrgSphere',
            description: `${orderData.planName} Plan Renewal/Upgrade`,
            order_id:    orderData.razorpayOrderId,
            prefill: {
                name:    userData.fullName || '',
                email:   userData.email || '',
                contact: userData.contactNumber || '',
                // removed method: 'upi' to allow all methods
            },
            theme: { color: '#6d28d9' }, // violet-700
            handler: async (response) => {
                try {
                    await paymentApi.verifyPayment(
                        orderData.paymentId,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature,
                    );
                    toast.success('✅ Payment successful! Subscription renewed & activated.');
                    resolve(true);
                } catch {
                    toast.error('Payment verification failed. Please contact support.');
                    resolve(false);
                }
            },
            modal: {
                ondismiss: () => resolve(false),
            },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    });
};

const SubscriptionPage = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const [activeTab, setActiveTab] = useState('plan');
    const [subData, setSubData] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [upgradingPlan, setUpgradingPlan] = useState(null);

    const fetchSubscription = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const res  = await subscriptionApi.getByOrganization(orgId);
            const data = res.data?.data || res.data;
            setSubData(data);
        } catch (err) {
            console.error('Fetch subscription error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        if (!orgId) return;
        setHistoryLoading(true);
        try {
            const res = await paymentApi.getByOrganization(orgId);
            const data = res.data?.data || res.data;
            // sort by created date descending
            setPaymentHistory(Array.isArray(data) ? data.sort((a,b) => b.id - a.id) : []);
        } catch (err) {
            console.error('Fetch payment history error:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
        fetchPaymentHistory();
    }, [orgId]);

    const handleUpgrade = async (planKey) => {
        if (!orgId || !user?.id) {
            toast.error('User or Organization details missing.');
            return;
        }

        setUpgradingPlan(planKey);
        try {
            const orderRes = await paymentApi.createOrder(planKey, orgId, user.id);
            const orderData = orderRes.data?.data || orderRes.data;

            if (!orderData?.razorpayOrderId) {
                toast.error('Could not create payment order.');
                setUpgradingPlan(null);
                return;
            }

            const success = await openRazorpay(orderData, {
                fullName:      user.fullName,
                email:         user.email,
                contactNumber: user.contactNumber || user.phone,
            });

            if (success) {
                await fetchSubscription();
                await fetchPaymentHistory();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment.');
        } finally {
            setUpgradingPlan(null);
        }
    };

    const downloadReceipt = (payment) => {
        const receiptHtml = `
            <html>
                <head>
                    <title>Payment Receipt - ${payment.paymentId || payment.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #6d28d9; padding-bottom: 20px; margin-bottom: 20px; }
                        h1 { color: #6d28d9; }
                        .details { margin-bottom: 40px; line-height: 1.6; }
                        .footer { font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>OrgSphere Invoice</h1>
                        <p><strong>Receipt No:</strong> ${payment.paymentId || payment.id}</p>
                    </div>
                    <div class="details">
                        <p><strong>Plan Name:</strong> ${payment.planName || 'N/A'}</p>
                        <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
                        <p><strong>Status:</strong> ${payment.status || 'SUCCESS'}</p>
                        <p><strong>Razorpay Payment ID:</strong> ${payment.razorpayPaymentId || 'N/A'}</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for your business. This is an automatically generated receipt.</p>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 200);
    };

    const calculateDaysLeft = (endDateStr) => {
        if (!endDateStr) return 0;
        const end = new Date(endDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = end - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const daysLeft = subData ? calculateDaysLeft(subData.endDate) : 0;
    const isExpired = subData?.status === 'EXPIRED' || daysLeft < 0;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 font-sans">
            
            {/* Header matching SettingsPage */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <FaCrown className="text-violet-600" /> Subscription &amp; Billing
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage your current plan, check expiration, and view payment history
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { fetchSubscription(); fetchPaymentHistory(); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
                    >
                        <FaSyncAlt className={loading || historyLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 space-x-4">
                <button
                    onClick={() => setActiveTab('plan')}
                    className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                        activeTab === 'plan'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <FaShieldAlt /> Current Plan &amp; Renewals
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                        activeTab === 'history'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <FaFileInvoiceDollar /> Payment History
                </button>
            </div>

            {/* Tab 1: Current Plan & Renewals */}
            {activeTab === 'plan' && (
                <div className="space-y-6">
                    {/* Current Active Plan Details Card */}
                    {loading ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[150px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : subData ? (
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Organization Plan</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <h2 className="text-2xl font-black text-gray-900">{subData.planName} PLAN</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            isExpired
                                                ? 'bg-red-100 text-red-700'
                                                : subData.status === 'TRIAL'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {isExpired ? 'EXPIRED' : subData.status === 'TRIAL' ? 'FREE TRIAL' : 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                    <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-xl shrink-0">
                                        <FaRegClock />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Days Remaining</p>
                                        <p className={`text-xl font-black ${daysLeft <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {daysLeft > 0 ? `${daysLeft} Days` : '0 Days (Expired)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-sm">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Start Date</p>
                                        <p className="font-semibold text-gray-800">{subData.startDate || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Expiry Date</p>
                                        <p className="font-semibold text-gray-800">{subData.endDate || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaShieldAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Last Charged</p>
                                        <p className="font-semibold text-gray-800">₹{subData.amount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {isExpired && (
                                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
                                    <FaExclamationTriangle className="text-base shrink-0" />
                                    <span>Your subscription has expired. Please select a plan below to renew and unlock all ERP features.</span>
                                </div>
                            )}

                            {subData.queuedPlans && subData.queuedPlans.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-800">Queued Plans</h3>
                                    {subData.queuedPlans.map((qp, index) => (
                                        <div key={index} className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                                                <FaRocket />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-violet-800 uppercase tracking-wide">Queue #{index + 1}</p>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                    {qp.planName} PLAN
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Scheduled For</p>
                                                <p className="text-xs font-bold text-gray-700 mt-0.5">{qp.startDate}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Plans Grid */}
                    <div>
                        <h2 className="text-base font-bold text-gray-900 mb-4">Available Plans &amp; Renewals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Free Trial */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">FREE</span>
                                        <span className="text-[10px] text-gray-400">7 Days</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Free Trial</h3>
                                    <div className="my-3">
                                        <span className="text-2xl font-black text-gray-900">₹0</span>
                                        <span className="text-xs text-gray-400"> / 7 days</span>
                                    </div>
                                    <ul className="space-y-2 text-xs text-gray-600 mb-6">
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-400 shrink-0"/> Full access to modules</li>
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-400 shrink-0"/> 7 days auto trial</li>
                                    </ul>
                                </div>
                                <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed">
                                    {subData?.planName === 'FREE' ? 'Current Plan' : 'Trial Expired'}
                                </button>
                            </div>

                            {/* Monthly Pro */}
                            <div className="bg-white rounded-2xl border-2 border-violet-600 p-6 flex flex-col justify-between shadow-md relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full">
                                    Most Popular
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-full">PRO</span>
                                        <span className="text-[10px] text-violet-600 font-semibold">Monthly</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Pro Plan</h3>
                                    <div className="my-3">
                                        <span className="text-2xl font-black text-gray-900">₹499</span>
                                        <span className="text-xs text-gray-400"> / month</span>
                                    </div>
                                    <ul className="space-y-2 text-xs text-gray-600 mb-6">
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-violet-500 shrink-0"/> Unlimited Users</li>
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-violet-500 shrink-0"/> Full ERP Modules</li>
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-violet-500 shrink-0"/> Priority Support</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleUpgrade('MONTHLY')}
                                    disabled={upgradingPlan === 'MONTHLY'}
                                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {upgradingPlan === 'MONTHLY' ? (
                                        <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                                    ) : (
                                        <><FaRocket /> Renew (+30 Days)</>
                                    )}
                                </button>
                            </div>

                            {/* Annual Enterprise */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">ANNUAL</span>
                                        <span className="text-[10px] text-emerald-600 font-semibold">Save 17%</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Yearly Plan</h3>
                                    <div className="my-3">
                                        <span className="text-2xl font-black text-gray-900">₹4,999</span>
                                        <span className="text-xs text-gray-400"> / year</span>
                                    </div>
                                    <ul className="space-y-2 text-xs text-gray-600 mb-6">
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-400 shrink-0"/> Everything in Pro</li>
                                        <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-400 shrink-0"/> 2 Months Free</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleUpgrade('YEARLY')}
                                    disabled={upgradingPlan === 'YEARLY'}
                                    className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {upgradingPlan === 'YEARLY' ? (
                                        <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                                    ) : (
                                        <><FaCrown /> Renew (+365 Days)</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Payment History */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm min-h-[300px]">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                        Billing &amp; Payment History
                    </h2>
                    
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <FaFileInvoiceDollar className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="text-sm font-medium text-gray-500">No payment history found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs text-gray-500 font-semibold bg-gray-50">
                                        <th className="p-3 rounded-tl-lg">Plan Name</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Payment ID</th>
                                        <th className="p-3 text-right rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="p-3">
                                                <p className="text-sm font-semibold text-gray-800">{payment.planName || 'N/A'}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(payment.paymentDate)}</p>
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">₹{payment.amount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                                    payment.paymentStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                    payment.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {payment.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-gray-500 font-mono">
                                                <p>{payment.transactionId || payment.id || 'N/A'}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">{payment.paymentMethod || 'RAZORPAY'}</p>
                                            </td>
                                            <td className="p-3 text-right">
                                                {payment.paymentStatus === 'COMPLETED' && (
                                                    <button 
                                                        onClick={() => downloadReceipt(payment)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 transition shadow-sm"
                                                    >
                                                        <FaDownload /> Receipt
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
