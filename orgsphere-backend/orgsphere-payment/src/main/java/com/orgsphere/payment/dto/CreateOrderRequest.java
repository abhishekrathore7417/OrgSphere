package com.orgsphere.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Plan name is required")
    private String planName;      // FREE / MONTHLY / YEARLY

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotNull(message = "User ID is required")
    private Long userId;
}