package com.orgsphere.school.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomResponse {

    private Long id;
    private String classroomName;
    private String classCode;
    private String section;
    private String session;
    private Integer capacity;
    private String classTeacher;
    private Long classTeacherId;
    private String status;
    private Long organizationId;
    private String organizationName;
}