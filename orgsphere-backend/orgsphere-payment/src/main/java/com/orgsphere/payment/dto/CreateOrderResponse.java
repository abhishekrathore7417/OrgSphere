package com.orgsphere.payment.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderResponse {
    private Long paymentId;
    private String razorpayOrderId;
    private Double amount;        // rupees
    private String currency;
    private String razorpayKeyId; // frontend checkout ke liye chahiye
    private String planName;
}