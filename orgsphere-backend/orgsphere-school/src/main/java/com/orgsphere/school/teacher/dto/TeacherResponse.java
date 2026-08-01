package com.orgsphere.school.teacher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {

    private Long id;
    private String teacherId;
    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private LocalDate joiningDate;
    private String status;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long organizationId;
    private String organizationName;
    private Double monthlySalary;
}