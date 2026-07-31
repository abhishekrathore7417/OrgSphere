import axiosInstance from './axiosInstance';

export const authApi = {
    // Login
    login: (email, password) =>
        axiosInstance.post('/api/auth/login', { email, password }),

    // Register Company
    registerCompany: (data) =>
        axiosInstance.post('/api/auth/register/company', data),

    // Register School
    registerSchool: (data) =>
        axiosInstance.post('/api/auth/register/school', data),

    // Forgot Password - Send OTP
    forgotPassword: (emailOrMobile) =>
        axiosInstance.post(`/api/auth/forgot-password?emailOrMobile=${encodeURIComponent(emailOrMobile)}`),

    // Verify OTP
    verifyOtp: (emailOrMobile, otp) =>
        axiosInstance.post(`/api/auth/verify-otp?emailOrMobile=${encodeURIComponent(emailOrMobile)}&otp=${encodeURIComponent(otp)}`),

    // Reset Password with OTP
    resetPassword: (emailOrMobile, otp, newPassword) =>
        axiosInstance.post(`/api/auth/reset-password?emailOrMobile=${encodeURIComponent(emailOrMobile)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`),
};