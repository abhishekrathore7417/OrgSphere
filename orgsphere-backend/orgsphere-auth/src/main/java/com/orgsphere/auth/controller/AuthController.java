package com.orgsphere.auth.controller;

import com.orgsphere.auth.dto.AuthResponse;
import com.orgsphere.auth.dto.LoginRequest;
import com.orgsphere.auth.dto.RegisterCompanyRequest;
import com.orgsphere.auth.dto.RegisterSchoolRequest;
import com.orgsphere.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/company")
    public AuthResponse registerCompany(
            @Valid @RequestBody RegisterCompanyRequest request) {
        System.out.println("===== COMPANY REGISTER API HIT =====");
        return authService.registerCompany(request);
    }

    @PostMapping("/register/school")
    public AuthResponse registerSchool(
            @Valid @RequestBody RegisterSchoolRequest request) {
        System.out.println("===== SCHOOL REGISTER API HIT =====");
        return authService.registerSchool(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {
        System.out.println("===== LOGIN API HIT =====");
        System.out.println("Email/Mobile : " + request.getEmail());
        return authService.login(request);
    }

    // ✅ Forgot Password - Send OTP
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String emailOrMobile) {
        System.out.println("===== FORGOT PASSWORD API HIT =====");
        System.out.println("Email/Mobile : " + emailOrMobile);
        return authService.forgotPassword(emailOrMobile);
    }

    // ✅ Verify OTP
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String emailOrMobile, @RequestParam String otp) {
        System.out.println("===== VERIFY OTP API HIT =====");
        boolean isValid = authService.verifyOtp(emailOrMobile, otp);
        return isValid ? "OTP verified successfully" : "Invalid OTP";
    }

    // ✅ Reset Password with OTP
    @PostMapping("/reset-password")
    public String resetPasswordWithOtp(
            @RequestParam String emailOrMobile,
            @RequestParam String otp,
            @RequestParam String newPassword) {
        System.out.println("===== RESET PASSWORD API HIT =====");
        authService.resetPasswordWithOtp(emailOrMobile, otp, newPassword);
        return "Password reset successfully";
    }
}