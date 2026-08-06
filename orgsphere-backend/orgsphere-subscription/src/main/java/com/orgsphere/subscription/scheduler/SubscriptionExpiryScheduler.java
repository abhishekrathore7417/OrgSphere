package com.orgsphere.subscription.scheduler;

import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.subscription.entity.Subscription;
import com.orgsphere.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubscriptionExpiryScheduler {

    private final SubscriptionRepository subscriptionRepository;

    // Roz raat 12:05 baje chalega
    @Scheduled(cron = "0 5 0 * * *")
    public void lockExpiredSubscriptions() {
        List<Subscription> expiring = subscriptionRepository.findByEndDateBeforeAndStatusIn(
                LocalDate.now(), List.of(SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE));

        for (Subscription sub : expiring) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
        }
        subscriptionRepository.saveAll(expiring);
    }
}