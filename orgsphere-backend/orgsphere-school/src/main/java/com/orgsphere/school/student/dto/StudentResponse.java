package com.orgsphere.school.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private String studentId;
    private LocalDate admissionDate;
    private String className;
    private String section;
    private Integer rollNumber;
    private String guardianName;
    private String guardianContact;
    private String guardianEmail;
    private String status;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long organizationId;
    private String organizationName;
}