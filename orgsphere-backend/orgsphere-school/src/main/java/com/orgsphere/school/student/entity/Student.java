package com.orgsphere.school.student.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;  // e.g., STU-001

    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;

    @Column(name = "class_name", nullable = false)
    private String className;  // e.g., Class 10, Class 12

    private String section;  // A, B, C

    @Column(name = "roll_number")
    private Integer rollNumber;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_contact")
    private String guardianContact;

    @Column(name = "guardian_email")
    private String guardianEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status;

    @Column(name = "optional_fee_types")
    private String optionalFeeTypes; // Comma-separated list of fee types (e.g., LIBRARY,SPORTS)

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}