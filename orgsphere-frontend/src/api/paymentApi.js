import axiosInstance from './axiosInstance';

export const paymentApi = {

    // Step 1: Razorpay order create karo
    // POST /api/payment/create-order
    // Body: { planName, organizationId, userId }
    // Returns: { razorpayOrderId, razorpayKeyId, amount, currency, paymentId, planName }
    createOrder: (planName, organizationId, userId) =>
        axiosInstance.post('/api/payment/create-order', {
            planName,
            organizationId,
            userId,
        }),

    // Step 2: Razorpay payment verify karo
    // POST /api/payment/verify
    // Body: { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
    verifyPayment: (paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
        axiosInstance.post('/api/payment/verify', {
            paymentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        }),

    // Payments by organization fetch karo
    // GET /api/payment/organization/{orgId}
    getByOrganization: (orgId) =>
        axiosInstance.get(`/api/payment/organization/${orgId}`),
};
