package com.orgsphere.subscription.dto;

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
public class SubscriptionRequest {
    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;
}