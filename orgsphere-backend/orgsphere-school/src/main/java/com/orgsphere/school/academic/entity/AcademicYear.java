package com.orgsphere.school.academic.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "academic_years")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AcademicYear extends BaseEntity {
    @Column(nullable = false)
    private String name; // e.g. 2026-27

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}
