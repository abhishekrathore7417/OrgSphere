package com.orgsphere.payment.service;

import com.orgsphere.payment.dto.PaymentRequest;
import com.orgsphere.payment.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPayment(Long id);

    List<PaymentResponse> getPaymentsByOrganization(Long organizationId);

    List<PaymentResponse> getPaymentsByUser(Long userId);

    List<PaymentResponse> getAllPayments();
}