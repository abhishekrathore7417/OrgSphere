package com.orgsphere.company.employee.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.EmploymentStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String department;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    private Double salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentStatus status;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}