package com.orgsphere.school.classroom.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.classroom.dto.ClassroomRequest;
import com.orgsphere.school.classroom.dto.ClassroomResponse;
import com.orgsphere.school.classroom.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/school/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    public ApiResponse createClassroom(@Valid @RequestBody ClassroomRequest request) {
        ClassroomResponse response = classroomService.createClassroom(request);
        return ApiResponse.success("Classroom created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getClassroom(@PathVariable Long id) {
        ClassroomResponse response = classroomService.getClassroom(id);
        return ApiResponse.success("Classroom fetched successfully", response);
    }

    @GetMapping("/code/{classCode}")
    public ApiResponse getClassroomByCode(@PathVariable String classCode) {
        ClassroomResponse response = classroomService.getClassroomByCode(classCode);
        return ApiResponse.success("Classroom fetched successfully", response);
    }

    @GetMapping("/name/{classroomName}")
    public ApiResponse getClassroomByName(@PathVariable String classroomName) {
        ClassroomResponse response = classroomService.getClassroomByName(classroomName);
        return ApiResponse.success("Classroom fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateClassroom(@PathVariable Long id, @Valid @RequestBody ClassroomRequest request) {
        ClassroomResponse response = classroomService.updateClassroom(id, request);
        return ApiResponse.success("Classroom updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteClassroom(@PathVariable Long id) {
        classroomService.deleteClassroom(id);
        return ApiResponse.success("Classroom deleted successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getClassroomsByOrganization(@PathVariable Long orgId) {
        List<ClassroomResponse> classrooms = classroomService.getClassroomsByOrganization(orgId);
        return ApiResponse.success("Classrooms fetched successfully", classrooms);
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse getClassroomsByTeacher(@PathVariable Long teacherId) {
        List<ClassroomResponse> classrooms = classroomService.getClassroomsByTeacher(teacherId);
        return ApiResponse.success("Classrooms fetched successfully", classrooms);
    }

    @GetMapping
    public ApiResponse getAllClassrooms() {
        List<ClassroomResponse> classrooms = classroomService.getAllClassrooms();
        return ApiResponse.success("All classrooms fetched successfully", classrooms);
    }
}