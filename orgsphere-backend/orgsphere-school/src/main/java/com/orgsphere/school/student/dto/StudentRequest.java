package com.orgsphere.school.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequest {
    private String studentId;

    @NotNull(message = "Admission date is required")
    private LocalDate admissionDate;

    @NotBlank(message = "Class name is required")
    private String className;

    private String section;

    private Integer rollNumber;

    private String guardianName;

    private String guardianContact;

    private String guardianEmail;

    private String session;  // e.g. "2025-26" — auto-filled from classroom

    private String status;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private String optionalFeeTypes;

    private Long classroomId;
}