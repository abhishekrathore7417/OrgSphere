package com.orgsphere.school.teacher.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.teacher.dto.TeacherRequest;
import com.orgsphere.school.teacher.dto.TeacherResponse;
import com.orgsphere.school.teacher.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/school/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping
    public ApiResponse createTeacher(@Valid @RequestBody TeacherRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return ApiResponse.success("Teacher created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getTeacher(@PathVariable Long id) {
        TeacherResponse response = teacherService.getTeacher(id);
        return ApiResponse.success("Teacher fetched successfully", response);
    }

    @GetMapping("/teacher-id/{teacherId}")
    public ApiResponse getTeacherByTeacherId(@PathVariable String teacherId) {
        TeacherResponse response = teacherService.getTeacherByTeacherId(teacherId);
        return ApiResponse.success("Teacher fetched successfully", response);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse getTeacherByUserId(@PathVariable Long userId) {
        TeacherResponse response = teacherService.getTeacherByUserId(userId);
        return ApiResponse.success("Teacher fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        TeacherResponse response = teacherService.updateTeacher(id, request);
        return ApiResponse.success("Teacher updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.success("Teacher deleted successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getTeachersByOrganization(@PathVariable Long orgId) {
        List<TeacherResponse> teachers = teacherService.getTeachersByOrganization(orgId);
        return ApiResponse.success("Teachers fetched successfully", teachers);
    }

    @GetMapping("/organization/{orgId}/specialization/{specialization}")
    public ApiResponse getTeachersBySpecialization(@PathVariable Long orgId, @PathVariable String specialization) {
        List<TeacherResponse> teachers = teacherService.getTeachersBySpecialization(orgId, specialization);
        return ApiResponse.success("Teachers fetched successfully", teachers);
    }

    @GetMapping
    public ApiResponse getAllTeachers() {
        List<TeacherResponse> teachers = teacherService.getAllTeachers();
        return ApiResponse.success("All teachers fetched successfully", teachers);
    }
}