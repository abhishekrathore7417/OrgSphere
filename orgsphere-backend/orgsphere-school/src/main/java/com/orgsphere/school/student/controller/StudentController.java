package com.orgsphere.school.student.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.student.dto.StudentRequest;
import com.orgsphere.school.student.dto.StudentResponse;
import com.orgsphere.school.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/school/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ApiResponse createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return ApiResponse.success("Student created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getStudent(@PathVariable Long id) {
        StudentResponse response = studentService.getStudent(id);
        return ApiResponse.success("Student fetched successfully", response);
    }

    @GetMapping("/student-id/{studentId}")
    public ApiResponse getStudentByStudentId(@PathVariable String studentId) {
        StudentResponse response = studentService.getStudentByStudentId(studentId);
        return ApiResponse.success("Student fetched successfully", response);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse getStudentByUserId(@PathVariable Long userId) {
        StudentResponse response = studentService.getStudentByUserId(userId);
        return ApiResponse.success("Student fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ApiResponse.success("Student updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ApiResponse.success("Student deleted successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getStudentsByOrganization(@PathVariable Long orgId) {
        List<StudentResponse> students = studentService.getStudentsByOrganization(orgId);
        return ApiResponse.success("Students fetched successfully", students);
    }

    @GetMapping("/organization/{orgId}/class/{className}")
    public ApiResponse getStudentsByClass(@PathVariable Long orgId, @PathVariable String className) {
        List<StudentResponse> students = studentService.getStudentsByClass(orgId, className);
        return ApiResponse.success("Students fetched successfully", students);
    }

    @GetMapping("/organization/{orgId}/class/{className}/section/{section}")
    public ApiResponse getStudentsByClassAndSection(
            @PathVariable Long orgId,
            @PathVariable String className,
            @PathVariable String section) {
        List<StudentResponse> students = studentService.getStudentsByClassAndSection(orgId, className, section);
        return ApiResponse.success("Students fetched successfully", students);
    }

    @GetMapping
    public ApiResponse getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ApiResponse.success("All students fetched successfully", students);
    }
}