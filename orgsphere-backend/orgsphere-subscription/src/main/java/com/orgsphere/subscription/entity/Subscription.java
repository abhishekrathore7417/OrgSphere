package com.orgsphere.subscription.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription extends BaseEntity {

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subscription_queue", joinColumns = @JoinColumn(name = "subscription_id"))
    @OrderBy("startDate ASC")
    private List<QueuedPlan> queuedPlans = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;
}