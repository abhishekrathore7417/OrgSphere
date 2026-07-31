package com.orgsphere.company.attendance.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.company.attendance.dto.AttendanceRequest;
import com.orgsphere.company.attendance.dto.AttendanceResponse;
import com.orgsphere.company.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/company/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Mark Attendance
    @PostMapping
    public ApiResponse markAttendance(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.markAttendance(request);
        return ApiResponse.success("Attendance marked successfully", response);
    }

    // Get Attendance by ID
    @GetMapping("/{id}")
    public ApiResponse getAttendance(@PathVariable Long id) {
        AttendanceResponse response = attendanceService.getAttendance(id);
        return ApiResponse.success("Attendance fetched successfully", response);
    }

    // Update Attendance
    @PutMapping("/{id}")
    public ApiResponse updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.updateAttendance(id, request);
        return ApiResponse.success("Attendance updated successfully", response);
    }

    // Delete Attendance
    @DeleteMapping("/{id}")
    public ApiResponse deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ApiResponse.success("Attendance deleted successfully");
    }

    // Get Attendance by User
    @GetMapping("/user/{userId}")
    public ApiResponse getAttendanceByUser(@PathVariable Long userId) {
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByUser(userId);
        return ApiResponse.success("Attendance fetched successfully", attendances);
    }

    // Get Attendance by Organization
    @GetMapping("/organization/{orgId}")
    public ApiResponse getAttendanceByOrganization(@PathVariable Long orgId) {
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByOrganization(orgId);
        return ApiResponse.success("Attendance fetched successfully", attendances);
    }

    // Get Attendance by Date
    @GetMapping("/organization/{orgId}/date/{date}")
    public ApiResponse getAttendanceByDate(@PathVariable Long orgId, @PathVariable String date) {
        LocalDate attendanceDate = LocalDate.parse(date);
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByDate(orgId, attendanceDate);
        return ApiResponse.success("Attendance fetched successfully", attendances);
    }

    // Get Today's Attendance
    @GetMapping("/today/{userId}")
    public ApiResponse getTodayAttendance(@PathVariable Long userId) {
        AttendanceResponse attendance = attendanceService.getTodayAttendance(userId);
        return ApiResponse.success("Today's attendance fetched successfully", attendance);
    }

    // Get Attendance by Date Range
    @GetMapping("/user/{userId}/range")
    public ApiResponse getAttendanceByDateRange(
            @PathVariable Long userId,
            @RequestParam String start,
            @RequestParam String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByUserAndDateRange(userId, startDate, endDate);
        return ApiResponse.success("Attendance fetched successfully", attendances);
    }
}