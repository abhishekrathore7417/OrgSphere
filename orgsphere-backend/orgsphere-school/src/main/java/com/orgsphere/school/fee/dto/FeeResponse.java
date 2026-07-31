package com.orgsphere.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeResponse {

    private Long id;
    private String feeType;
    private Double amount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private Double paidAmount;
    private Double remainingAmount;
    private Double penalty;
    private String description;
    private String status;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long organizationId;
    private String organizationName;
}