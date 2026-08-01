package com.orgsphere.school.teacher.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.TeacherStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher extends BaseEntity {

    @Column(name = "teacher_id", unique = true, nullable = false)
    private String teacherId;  // e.g., TCH-001

    @Column(name = "specialization", nullable = false)
    private String specialization;  // Math, Science, English, etc.

    @Column(name = "qualification", nullable = false)
    private String qualification;  // B.Ed, M.Sc, M.A, etc.

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeacherStatus status;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
    @Column(name = "monthly_salary")
    private Double monthlySalary;

// Getter & Setter (Lombok @Getter @Setter already hai, toh bas field add karo)
}