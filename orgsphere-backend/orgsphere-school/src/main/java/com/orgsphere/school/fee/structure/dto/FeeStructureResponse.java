package com.orgsphere.school.fee.structure.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeStructureResponse {
    private Long id;
    private String feeType;
    private Double amount;
    private String frequency;
    private Integer dueDay;
    private String description;
    private Boolean isActive;
    private Long organizationId;
    private String organizationName;
}
