package com.orgsphere.auth.service;

import com.orgsphere.auth.dto.AuthResponse;
import com.orgsphere.auth.dto.LoginRequest;
import com.orgsphere.auth.dto.RegisterCompanyRequest;
import com.orgsphere.auth.dto.RegisterSchoolRequest;
import com.orgsphere.common.enums.AccountStatus;
import com.orgsphere.common.enums.OrganizationType;
import com.orgsphere.common.enums.RoleType;
import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.common.exception.UnauthorizedException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.security.jwt.JwtService;
import com.orgsphere.subscription.entity.Subscription;
import com.orgsphere.subscription.repository.SubscriptionRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Organization organization = new Organization();
        organization.setOrganizationName(request.getOrganizationName());
        organization.setOrganizationType(OrganizationType.COMPANY);
        organization.setEmail(request.getEmail());
        organization.setContactNumber(request.getContactNumber());
        organization.setAddress(request.getAddress());
        organization.setStatus(AccountStatus.ACTIVE);

        Organization savedOrganization = organizationRepository.save(organization);

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContactNumber(request.getContactNumber());
        user.setRole(RoleType.ORG_ADMIN);
        user.setStatus(AccountStatus.ACTIVE);
        user.setOrganization(savedOrganization);

        User savedUser = userRepository.save(user);

        Subscription subscription = new Subscription();
        subscription.setPlanName("TRIAL");
        subscription.setAmount(0.0);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusDays(7));
        subscription.setStatus(SubscriptionStatus.TRIAL);
        subscription.setOrganization(savedOrganization);

        subscriptionRepository.save(subscription);

        String token = jwtService.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .message("Company registered successfully")
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .organizationType(savedOrganization.getOrganizationType().name())
                .organizationName(savedOrganization.getOrganizationName())
                .organizationId(savedOrganization.getId())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerSchool(RegisterSchoolRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Organization organization = new Organization();
        organization.setOrganizationName(request.getOrganizationName());
        organization.setOrganizationType(OrganizationType.SCHOOL);
        organization.setEmail(request.getEmail());
        organization.setContactNumber(request.getContactNumber());
        organization.setAddress(request.getAddress());
        organization.setStatus(AccountStatus.ACTIVE);

        Organization savedOrganization = organizationRepository.save(organization);

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContactNumber(request.getContactNumber());
        user.setRole(RoleType.ORG_ADMIN);
        user.setStatus(AccountStatus.ACTIVE);
        user.setOrganization(savedOrganization);

        User savedUser = userRepository.save(user);

        Subscription subscription = new Subscription();
        subscription.setPlanName("TRIAL");
        subscription.setAmount(0.0);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusDays(7));
        subscription.setStatus(SubscriptionStatus.TRIAL);
        subscription.setOrganization(savedOrganization);

        subscriptionRepository.save(subscription);

        String token = jwtService.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .message("School registered successfully")
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .organizationType(savedOrganization.getOrganizationType().name())
                .organizationName(savedOrganization.getOrganizationName())
                .organizationId(savedOrganization.getId())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        String loginId = request.getEmail();

        User user = userRepository.findByEmailOrMobile(loginId)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/mobile or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email/mobile or password");
        }

        Organization organization = organizationRepository.findById(user.getOrganization().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .organizationType(organization.getOrganizationType().name())
                .organizationName(organization.getOrganizationName())
                .organizationId(organization.getId())
                .build();
    }

    @Override
    public String forgotPassword(String emailOrMobile) {
        User user = userRepository.findByEmailOrMobile(emailOrMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with: " + emailOrMobile));

        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        otpStore.put(emailOrMobile, otp);

        // Detect karo - email hai ya mobile number
        boolean isMobile = emailOrMobile.matches("\\d{10,15}");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("OrgSphere - Password Reset OTP");
        message.setText("Dear " + user.getFullName() + ",\n\n"
                + "Your OTP for password reset is: " + otp + "\n\n"
                + "This OTP is valid for 5 minutes.\n\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "Regards,\nOrgSphere Team");
        message.setFrom("abhishekrathore7417@gmail.com");

        try {
            mailSender.send(message);
            System.out.println("✅ OTP sent successfully to email: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Mail send failed: " + e.getMessage());
            System.out.println("🔑 OTP for " + emailOrMobile + " is: " + otp + " (use this for testing)");
        }

        // Response message - mobile se request aaye to batao email pe gaya
        if (isMobile) {
            // Mask email - only show first 3 chars and domain
            String email = user.getEmail();
            int atIdx = email.indexOf('@');
            String maskedEmail = email.substring(0, Math.min(3, atIdx)) + "***" + email.substring(atIdx);
            return "OTP sent to your registered email: " + maskedEmail;
        }

        return "OTP sent to your registered email";
    }

    // ✅ Verify OTP
    @Override
    public boolean verifyOtp(String emailOrMobile, String otp) {
        String storedOtp = otpStore.get(emailOrMobile);
        if (storedOtp == null) {
            throw new BadRequestException("OTP not found or expired");
        }
        if (!storedOtp.equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }
        return true;
    }

    // ✅ Reset Password with OTP
    @Override
    public void resetPasswordWithOtp(String emailOrMobile, String otp, String newPassword) {
        verifyOtp(emailOrMobile, otp);
        User user = userRepository.findByEmailOrMobile(emailOrMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(emailOrMobile);
    }
}