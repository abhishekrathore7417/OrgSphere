package com.orgsphere.subscription.util;

import com.orgsphere.common.enums.SubscriptionStatus;
import com.orgsphere.common.exception.BadRequestException;

import java.time.LocalDate;

public class PlanUtil {

    public static double getAmount(String planName) {
        switch (planName.toUpperCase()) {
            case "FREE":    return 0.0;
            case "MONTHLY": return 499.0;
            case "YEARLY":  return 4999.0;
            default: throw new BadRequestException("Invalid plan name: " + planName);
        }
    }

    public static LocalDate getEndDate(String planName, LocalDate startDate) {
        switch (planName.toUpperCase()) {
            case "FREE":    return startDate.plusDays(7);
            case "MONTHLY": return startDate.plusMonths(1);
            case "YEARLY":  return startDate.plusYears(1);
            default: throw new BadRequestException("Invalid plan name: " + planName);
        }
    }

    public static SubscriptionStatus getInitialStatus(String planName) {
        return planName.equalsIgnoreCase("FREE") ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE;
    }
}