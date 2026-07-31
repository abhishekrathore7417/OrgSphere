package com.orgsphere.school.fee.dto;

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
public class FeeRequest {

    @NotBlank(message = "Fee type is required")
    private String feeType;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private LocalDate paidDate;

    private Double paidAmount;

    private Double remainingAmount;

    private Double penalty;

    private String description;

    private String status;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;
}