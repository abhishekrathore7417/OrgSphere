package com.orgsphere.company.attendance.service;

import com.orgsphere.company.attendance.dto.AttendanceRequest;
import com.orgsphere.company.attendance.dto.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceRequest request);

    AttendanceResponse getAttendance(Long id);

    AttendanceResponse updateAttendance(Long id, AttendanceRequest request);

    void deleteAttendance(Long id);

    List<AttendanceResponse> getAttendanceByUser(Long userId);

    List<AttendanceResponse> getAttendanceByOrganization(Long organizationId);

    List<AttendanceResponse> getAttendanceByDate(Long organizationId, LocalDate date);

    AttendanceResponse getTodayAttendance(Long userId);

    List<AttendanceResponse> getAttendanceByUserAndDateRange(Long userId, LocalDate start, LocalDate end);
}