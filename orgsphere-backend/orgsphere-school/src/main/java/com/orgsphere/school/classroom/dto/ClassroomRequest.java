package com.orgsphere.school.classroom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomRequest {

    @NotBlank(message = "Classroom name is required")
    private String classroomName;

    // classCode is auto-generated — not required from frontend
    private String classCode;

    private String section;

    private String session;

    private Integer capacity;

    private String classTeacher;

    private Long classTeacherId;

    private String status;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;
}