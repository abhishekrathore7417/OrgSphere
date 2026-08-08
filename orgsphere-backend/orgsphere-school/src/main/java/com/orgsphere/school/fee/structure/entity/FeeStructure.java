package com.orgsphere.school.fee.structure.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fee_structures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeStructure extends BaseEntity {
    @Column(name = "fee_type", nullable = false)
    private String feeType; // TUITION, TRANSPORT, EXAM, LIBRARY, SPORTS

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String frequency; // MONTHLY, QUARTERLY, YEARLY, ONE_TIME

    @Column(name = "due_day", nullable = false)
    private Integer dueDay; // 1-28, day of month when fee is due

    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}
