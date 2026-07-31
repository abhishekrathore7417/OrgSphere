package com.orgsphere.subscription.service;

import com.orgsphere.subscription.dto.SubscriptionRequest;
import com.orgsphere.subscription.dto.SubscriptionResponse;

import java.util.List;

public interface SubscriptionService {
    SubscriptionResponse getSubscriptionByOrganization(Long organizationId);
    SubscriptionResponse getSubscriptionStatus(Long organizationId);
    SubscriptionResponse upgradeSubscription(SubscriptionRequest request);
    SubscriptionResponse renewSubscription(Long subscriptionId);
    List<SubscriptionResponse> getExpiredSubscriptions();
    boolean isSubscriptionActive(Long organizationId);
}