package com.orgsphere.school.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SchoolAttendanceRequest {
    private Long userId;          // Keep userId to match frontend
    private Long organizationId;
    private LocalDate attendanceDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status;        // PRESENT, ABSENT, ON_LEAVE
    private String remarks;
}