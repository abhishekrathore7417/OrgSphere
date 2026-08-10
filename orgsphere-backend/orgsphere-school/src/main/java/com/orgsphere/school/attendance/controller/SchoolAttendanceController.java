package com.orgsphere.school.attendance.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.attendance.dto.SchoolAttendanceRequest;
import com.orgsphere.school.attendance.dto.SchoolAttendanceResponse;
import com.orgsphere.school.attendance.service.SchoolAttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/school/attendances")
@RequiredArgsConstructor
public class SchoolAttendanceController {

    private final SchoolAttendanceService attendanceService;

    @PostMapping
    public ApiResponse markAttendance(@Valid @RequestBody SchoolAttendanceRequest request) {
        SchoolAttendanceResponse res = attendanceService.markAttendance(request);
        return ApiResponse.success("Attendance marked", res);
    }

    @PutMapping("/{id}")
    public ApiResponse updateAttendance(@PathVariable Long id, @Valid @RequestBody SchoolAttendanceRequest request) {
        SchoolAttendanceResponse res = attendanceService.updateAttendance(id, request);
        return ApiResponse.success("Attendance updated", res);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ApiResponse.success("Attendance deleted");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getByOrganization(@PathVariable Long orgId) {
        List<SchoolAttendanceResponse> list = attendanceService.getAttendanceByOrganization(orgId);
        return ApiResponse.success("Fetched", list);
    }

    @GetMapping("/organization/{orgId}/date")
    public ApiResponse getByDate(@PathVariable Long orgId,
                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SchoolAttendanceResponse> list = attendanceService.getAttendanceByDate(orgId, date);
        return ApiResponse.success("Fetched", list);
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse getByStudent(@PathVariable Long studentId) {
        List<SchoolAttendanceResponse> list = attendanceService.getAttendanceByStudent(studentId);
        return ApiResponse.success("Fetched", list);
    }

    @GetMapping("/classroom/{classroomId}")
    public ApiResponse getByClassroom(@PathVariable Long classroomId) {
        List<SchoolAttendanceResponse> list = attendanceService.getAttendanceByClassroom(classroomId);
        return ApiResponse.success("Fetched", list);
    }
}