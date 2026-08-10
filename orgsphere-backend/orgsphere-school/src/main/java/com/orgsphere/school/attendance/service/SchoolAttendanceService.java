package com.orgsphere.school.attendance.service;

import com.orgsphere.school.attendance.dto.SchoolAttendanceRequest;
import com.orgsphere.school.attendance.dto.SchoolAttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface SchoolAttendanceService {
    SchoolAttendanceResponse markAttendance(SchoolAttendanceRequest request);
    SchoolAttendanceResponse updateAttendance(Long id, SchoolAttendanceRequest request);
    void deleteAttendance(Long id);
    List<SchoolAttendanceResponse> getAttendanceByOrganization(Long organizationId);
    List<SchoolAttendanceResponse> getAttendanceByDate(Long organizationId, LocalDate date);
    List<SchoolAttendanceResponse> getAttendanceByStudent(Long studentId);
    // Optional: get by classroom
    List<SchoolAttendanceResponse> getAttendanceByClassroom(Long classroomId);
}