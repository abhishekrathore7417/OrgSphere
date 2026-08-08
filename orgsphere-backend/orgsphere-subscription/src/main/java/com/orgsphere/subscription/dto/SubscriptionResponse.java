package com.orgsphere.subscription.dto;

import com.orgsphere.subscription.entity.QueuedPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private Long id;
    private String planName;
    private Double amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long organizationId;
    private String organizationName;

    private List<QueuedPlan> queuedPlans;
}