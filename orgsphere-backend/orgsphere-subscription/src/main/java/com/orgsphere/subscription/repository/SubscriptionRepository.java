package com.orgsphere.subscription.repository;

import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // Find subscription by organization
    Optional<Subscription> findByOrganization(Organization organization);

    // Find subscriptions by status
    List<Subscription> findByStatus(SubscriptionStatus status);
    List<Subscription> findByEndDateBeforeAndStatusIn(LocalDate date, List<SubscriptionStatus> statuses);

    // Check if organization has active subscription
    boolean existsByOrganizationAndStatus(Organization organization, SubscriptionStatus status);
}