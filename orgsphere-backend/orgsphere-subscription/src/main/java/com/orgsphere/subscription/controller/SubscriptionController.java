package com.orgsphere.subscription.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.subscription.dto.SubscriptionRequest;
import com.orgsphere.subscription.dto.SubscriptionResponse;
import com.orgsphere.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // Get subscription by organization
    @GetMapping("/organization/{orgId}")
    public ApiResponse getSubscriptionByOrganization(@PathVariable Long orgId) {
        SubscriptionResponse response = subscriptionService.getSubscriptionByOrganization(orgId);
        return ApiResponse.success("Subscription fetched successfully", response);
    }

    // Check subscription status
    @GetMapping("/status/{orgId}")
    public ApiResponse getSubscriptionStatus(@PathVariable Long orgId) {
        SubscriptionResponse response = subscriptionService.getSubscriptionStatus(orgId);
        return ApiResponse.success("Subscription status fetched successfully", response);
    }

    // Upgrade subscription
    @PostMapping("/upgrade")
    public ApiResponse upgradeSubscription(@Valid @RequestBody SubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.upgradeSubscription(request);
        return ApiResponse.success("Subscription upgraded successfully", response);
    }

    // Renew subscription
    @PutMapping("/renew/{id}")
    public ApiResponse renewSubscription(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.renewSubscription(id);
        return ApiResponse.success("Subscription renewed successfully", response);
    }

    // Get expired subscriptions
    @GetMapping("/expired")
    public ApiResponse getExpiredSubscriptions() {
        List<SubscriptionResponse> subscriptions = subscriptionService.getExpiredSubscriptions();
        return ApiResponse.success("Expired subscriptions fetched successfully", subscriptions);
    }

    // Check if subscription is active
    @GetMapping("/active/{orgId}")
    public ApiResponse isSubscriptionActive(@PathVariable Long orgId) {
        boolean isActive = subscriptionService.isSubscriptionActive(orgId);
        return ApiResponse.success("Subscription active status", isActive);
    }
}