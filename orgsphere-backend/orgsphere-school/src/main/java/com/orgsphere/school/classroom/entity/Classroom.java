package com.orgsphere.school.classroom.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.ClassroomStatus;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom extends BaseEntity {

    private String classroomName;  // e.g., "Class 10-A", "Room 101"

    @Column(name = "class_code", nullable = false)
    private String classCode;  // auto-generated, e.g., "CLS-10A-2025-26-1234"

    private String section;  // A, B, C

    @Column(name = "session")
    private String session;  // e.g. 2025-26

    private Integer capacity;  // Maximum students

    @Column(name = "class_teacher")
    private String classTeacher;  // Teacher name

    @Column(name = "class_teacher_id")
    private Long classTeacherId;  // Teacher user ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassroomStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}