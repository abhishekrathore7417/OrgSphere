package com.orgsphere.school.holiday.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "holidays")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Holiday extends BaseEntity {
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}
