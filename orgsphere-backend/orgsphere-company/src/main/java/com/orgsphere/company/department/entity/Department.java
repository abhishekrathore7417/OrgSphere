package com.orgsphere.company.department.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

import com.orgsphere.common.enums.DepartmentStatus;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Column(name = "department_name", nullable = false, unique = true)
    private String departmentName;

    private String description;

    @Column(name = "session")
    private String session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartmentStatus status = DepartmentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}