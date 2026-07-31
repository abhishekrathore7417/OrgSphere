package com.orgsphere.payment.service;

import com.orgsphere.common.enums.PaymentStatus;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.payment.dto.PaymentRequest;
import com.orgsphere.payment.dto.PaymentResponse;
import com.orgsphere.payment.entity.Payment;
import com.orgsphere.payment.repository.PaymentRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = new Payment();
        payment.setAmount(request.getAmount());
        payment.setPlanName(request.getPlanName());  // ✅ Ab ye method exist karega
        payment.setPaymentStatus(PaymentStatus.COMPLETED);  // ✅ Ab ye method exist karega
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        payment.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : generateTransactionId());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrganization(organization);
        payment.setUser(user);  // ✅ Ab ye method exist karega

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Override
    public PaymentResponse getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return paymentRepository.findByOrganization(organization)  // ✅ Ab ye method exist karega
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getPaymentsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return paymentRepository.findByUser(user)  // ✅ Ab ye method exist karega
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + (int) (Math.random() * 1000);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .planName(payment.getPlanName())
                .paymentStatus(payment.getPaymentStatus().name())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .organizationId(payment.getOrganization().getId())
                .organizationName(payment.getOrganization().getOrganizationName())
                .userId(payment.getUser().getId())
                .userFullName(payment.getUser().getFullName())
                .build();
    }
}