package com.orgsphere.auth.service;

import com.orgsphere.auth.dto.AuthResponse;
import com.orgsphere.auth.dto.LoginRequest;
import com.orgsphere.auth.dto.RegisterCompanyRequest;
import com.orgsphere.auth.dto.RegisterSchoolRequest;

public interface AuthService {

    AuthResponse registerCompany(RegisterCompanyRequest request);

    AuthResponse registerSchool(RegisterSchoolRequest request);

    AuthResponse login(LoginRequest request);

    // ✅ Forgot Password - Send OTP
    String forgotPassword(String emailOrMobile);

    // ✅ Verify OTP
    boolean verifyOtp(String emailOrMobile, String otp);

    // ✅ Reset Password with OTP
    void resetPasswordWithOtp(String emailOrMobile, String otp, String newPassword);
}