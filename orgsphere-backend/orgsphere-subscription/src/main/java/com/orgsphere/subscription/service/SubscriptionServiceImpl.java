package com.orgsphere.subscription.service;

import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.subscription.dto.SubscriptionRequest;
import com.orgsphere.subscription.dto.SubscriptionResponse;
import com.orgsphere.subscription.entity.Subscription;
import com.orgsphere.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional  // ✅ Add this at class level
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public SubscriptionResponse getSubscriptionByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Subscription subscription = subscriptionRepository.findByOrganization(organization)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found for organization"));

        return mapToResponse(subscription);
    }

    @Override
    public SubscriptionResponse getSubscriptionStatus(Long organizationId) {
        SubscriptionResponse response = getSubscriptionByOrganization(organizationId);

        // Check if subscription is expired
        if (response.getEndDate().isBefore(LocalDate.now())) {
            response.setStatus(SubscriptionStatus.EXPIRED.name());
        }

        return response;
    }

    @Override
    public SubscriptionResponse upgradeSubscription(SubscriptionRequest request) {
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Subscription subscription = subscriptionRepository.findByOrganization(organization)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        // Update subscription
        subscription.setPlanName(request.getPlanName());
        subscription.setAmount(request.getAmount());
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusYears(1));
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        Subscription updated = subscriptionRepository.save(subscription);
        return mapToResponse(updated);
    }

    @Override
    public SubscriptionResponse renewSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusYears(1));
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        Subscription renewed = subscriptionRepository.save(subscription);
        return mapToResponse(renewed);
    }

    @Override
    public List<SubscriptionResponse> getExpiredSubscriptions() {
        return subscriptionRepository.findByStatus(SubscriptionStatus.EXPIRED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isSubscriptionActive(Long organizationId) {
        try {
            SubscriptionResponse response = getSubscriptionStatus(organizationId);
            return response.getStatus().equals(SubscriptionStatus.ACTIVE.name())
                    && response.getEndDate().isAfter(LocalDate.now());
        } catch (Exception e) {
            return false;
        }
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        // ✅ Explicitly load organization to avoid lazy loading
        Organization org = organizationRepository.findById(subscription.getOrganization().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .planName(subscription.getPlanName())
                .amount(subscription.getAmount())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .status(subscription.getStatus().name())
                .organizationId(org.getId())
                .organizationName(org.getOrganizationName())
                .build();
    }
}