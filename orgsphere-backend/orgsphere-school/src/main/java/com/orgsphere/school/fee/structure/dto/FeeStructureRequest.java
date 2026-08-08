package com.orgsphere.school.fee.structure.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeStructureRequest {
    private String feeType;
    private Double amount;
    private String frequency;
    private Integer dueDay;
    private String description;
    private Long organizationId;
}
