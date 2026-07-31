import axiosInstance from './axiosInstance';

export const organizationApi = {
    // Create User
    createUser: (data) =>
        axiosInstance.post('/api/users', data),

    // Get User
    getUser: (id) =>
        axiosInstance.get(`/api/users/${id}`),

    // Update User
    updateUser: (id, data) =>
        axiosInstance.put(`/api/users/${id}`, data),

    // Delete User
    deleteUser: (id) =>
        axiosInstance.delete(`/api/users/${id}`),

    // Get Users by Organization
    getUsersByOrganization: (orgId) =>
        axiosInstance.get(`/api/users/organization/${orgId}`),

    // Get All Users
    getAllUsers: () =>
        axiosInstance.get('/api/users'),
};