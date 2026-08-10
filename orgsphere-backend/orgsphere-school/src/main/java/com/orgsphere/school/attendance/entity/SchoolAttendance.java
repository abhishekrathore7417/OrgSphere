package com.orgsphere.school.attendance.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.AttendanceStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "school_attendances")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SchoolAttendance extends BaseEntity {

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    private String remarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}