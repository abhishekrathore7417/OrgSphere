package com.orgsphere.school.fee.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fee extends BaseEntity {

    @Column(name = "fee_type", nullable = false)
    private String feeType;  // TUITION, EXAM, LIBRARY, SPORTS, TRANSPORT, etc.

    @Column(nullable = false)
    private Double amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "remaining_amount")
    private Double remainingAmount;

    private Double penalty;  // Late fee penalty

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;  // Student (User)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}