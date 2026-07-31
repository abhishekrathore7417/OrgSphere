package com.orgsphere.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String paymentMethod;  // CARD, UPI, NET_BANKING
    private String transactionId;
}