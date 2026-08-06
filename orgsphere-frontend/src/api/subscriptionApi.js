import axiosInstance from './axiosInstance';

export const subscriptionApi = {

    // Subscription status fetch karo by orgId
    // GET /api/subscription/organization/{orgId}
    getByOrganization: (orgId) =>
        axiosInstance.get(`/api/subscription/organization/${orgId}`),

    // Active hai ya nahi check karo
    // GET /api/subscription/active/{orgId}
    isActive: (orgId) =>
        axiosInstance.get(`/api/subscription/active/${orgId}`),

    // Plan upgrade karo (FREE plan ke liye — no payment needed)
    // POST /api/subscription/upgrade
    // Body: { planName: "FREE", amount: 0, organizationId }
    upgrade: (planName, organizationId, amount) =>
        axiosInstance.post('/api/subscription/upgrade', {
            planName,
            amount,
            organizationId,
        }),

    // Subscription renew karo by subscriptionId
    // PUT /api/subscription/renew/{id}
    renew: (subscriptionId) =>
        axiosInstance.put(`/api/subscription/renew/${subscriptionId}`),
};
