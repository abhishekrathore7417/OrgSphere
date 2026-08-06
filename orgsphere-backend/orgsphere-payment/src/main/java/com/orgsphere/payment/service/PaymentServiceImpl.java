package com.orgsphere.payment.service;

import com.orgsphere.common.enums.PaymentStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.payment.dto.*;
import com.orgsphere.payment.entity.Payment;
import com.orgsphere.payment.repository.PaymentRepository;
import com.orgsphere.subscription.dto.SubscriptionRequest;
import com.orgsphere.subscription.service.SubscriptionService;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
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
    private final SubscriptionService subscriptionService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ============ NAYA: Step 1 — Order create karo ============
    @Override
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String planName = request.getPlanName().toUpperCase();
        double amount = com.orgsphere.subscription.util.PlanUtil.getAmount(planName);

        if (amount <= 0) {
            throw new BadRequestException("FREE plan requires no payment. Call /api/subscription/upgrade directly.");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", Math.round(amount * 100)); // paise me
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "org_" + organization.getId() + "_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = client.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            Payment payment = new Payment();
            payment.setAmount(amount);
            payment.setPlanName(planName);
            payment.setPaymentStatus(PaymentStatus.PENDING);   // abhi sirf PENDING
            payment.setPaymentMethod("RAZORPAY");
            payment.setTransactionId(razorpayOrderId);
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setOrganization(organization);
            payment.setUser(user);

            Payment saved = paymentRepository.save(payment);

            return CreateOrderResponse.builder()
                    .paymentId(saved.getId())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amount)
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .planName(planName)
                    .build();

        } catch (RazorpayException e) {
            throw new BadRequestException("Could not create payment order: " + e.getMessage());
        }
    }

    // ============ NAYA: Step 2 — Payment verify + Subscription update ============
    @Override
    public PaymentResponse verifyPayment(VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new BadRequestException("Payment verification failed — signature mismatch");
            }

            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setPaymentDate(LocalDateTime.now());
            Payment saved = paymentRepository.save(payment);

            // Payment confirm hote hi Subscription bhi activate/renew ho jayegi
            SubscriptionRequest subReq = SubscriptionRequest.builder()
                    .planName(saved.getPlanName())
                    .amount(saved.getAmount())
                    .organizationId(saved.getOrganization().getId())
                    .build();
            subscriptionService.upgradeSubscription(subReq);

            return mapToResponse(saved);

        } catch (RazorpayException e) {
            throw new BadRequestException("Signature verification error: " + e.getMessage());
        }
    }

    // ============ PURANE methods same rahenge ============
    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = new Payment();
        payment.setAmount(request.getAmount());
        payment.setPlanName(request.getPlanName());
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        payment.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : generateTransactionId());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrganization(organization);
        payment.setUser(user);

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
        return paymentRepository.findByOrganization(organization).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getPaymentsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return paymentRepository.findByUser(user).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
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