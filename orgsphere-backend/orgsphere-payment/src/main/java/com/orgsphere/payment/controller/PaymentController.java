package com.orgsphere.payment.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.payment.dto.*;
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

    // ── Existing endpoints ─────────────────────────────────

    @PostMapping
    public ApiResponse createPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ApiResponse.success("Payment created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getPayment(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPayment(id);
        return ApiResponse.success("Payment fetched successfully", response);
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getPaymentsByOrganization(@PathVariable Long orgId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrganization(orgId);
        return ApiResponse.success("Payments fetched successfully", payments);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ApiResponse.success("Payments fetched successfully", payments);
    }

    @GetMapping
    public ApiResponse getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ApiResponse.success("All payments fetched successfully", payments);
    }

    // ── NEW: Razorpay Order Create ──────────────────────────
    // Frontend POST /api/payment/create-order
    // Body: { planName, organizationId, userId }
    @PostMapping("/create-order")
    public ApiResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        CreateOrderResponse response = paymentService.createOrder(request);
        return ApiResponse.success("Order created successfully", response);
    }

    // ── NEW: Razorpay Payment Verify ────────────────────────
    // Frontend POST /api/payment/verify
    // Body: { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
    @PostMapping("/verify")
    public ApiResponse verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        PaymentResponse response = paymentService.verifyPayment(request);
        return ApiResponse.success("Payment verified successfully", response);
    }
}
