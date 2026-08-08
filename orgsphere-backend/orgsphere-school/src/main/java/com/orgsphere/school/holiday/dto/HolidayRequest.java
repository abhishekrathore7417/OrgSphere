package com.orgsphere.school.holiday.dto;

import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HolidayRequest {
    private LocalDate date;
    private String name;
    private Long organizationId;
}
