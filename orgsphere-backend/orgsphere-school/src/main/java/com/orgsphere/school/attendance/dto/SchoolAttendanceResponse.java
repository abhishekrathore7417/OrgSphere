package com.orgsphere.school.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SchoolAttendanceResponse {
    private Long id;
    private LocalDate attendanceDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status;
    private String remarks;
    private Long userId;          // same as frontend expects
    private String userFullName;
    private String userEmail;
    private Long organizationId;
    private String organizationName;
    // Extra fields if needed (classroomId, etc.) – but not required if we keep userId
}