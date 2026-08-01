package com.orgsphere.school.teacher.dto;

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
public class TeacherRequest {

    @NotBlank(message = "Teacher ID is required")
    private String teacherId;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    private Integer experienceYears;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private String status;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Double monthlySalary;
}