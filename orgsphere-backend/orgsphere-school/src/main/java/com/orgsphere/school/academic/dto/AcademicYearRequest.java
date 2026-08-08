package com.orgsphere.school.academic.dto;

import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AcademicYearRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private Long organizationId;
}
