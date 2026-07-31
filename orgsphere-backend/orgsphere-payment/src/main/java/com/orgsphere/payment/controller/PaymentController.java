package com.orgsphere.payment.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.payment.dto.PaymentRequest;
import com.orgsphere.payment.dto.PaymentResponse;
import com.orgsphere.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Create payment
    @PostMapping
    public ApiResponse createPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ApiResponse.success("Payment created successfully", response);
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ApiResponse getPayment(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPayment(id);
        return ApiResponse.success("Payment fetched successfully", response);
    }

    // Get payments by organization
    @GetMapping("/organization/{orgId}")
    public ApiResponse getPaymentsByOrganization(@PathVariable Long orgId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrganization(orgId);
        return ApiResponse.success("Payments fetched successfully", payments);
    }

    // Get payments by user
    @GetMapping("/user/{userId}")
    public ApiResponse getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ApiResponse.success("Payments fetched successfully", payments);
    }

    // Get all payments (Admin only)
    @GetMapping
    public ApiResponse getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ApiResponse.success("All payments fetched successfully", payments);
    }
}