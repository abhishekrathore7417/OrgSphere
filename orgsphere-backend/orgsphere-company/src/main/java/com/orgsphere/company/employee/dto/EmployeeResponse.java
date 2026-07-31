package com.orgsphere.company.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String employeeId;
    private String designation;
    private String department;
    private LocalDate joiningDate;
    private Double salary;
    private String status;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long organizationId;
    private String organizationName;
}