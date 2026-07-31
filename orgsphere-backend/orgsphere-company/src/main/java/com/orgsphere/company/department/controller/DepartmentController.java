package com.orgsphere.company.department.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.company.department.dto.DepartmentRequest;
import com.orgsphere.company.department.dto.DepartmentResponse;
import com.orgsphere.company.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ApiResponse createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.createDepartment(request);
        return ApiResponse.success("Department created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getDepartment(@PathVariable Long id) {
        DepartmentResponse response = departmentService.getDepartment(id);
        return ApiResponse.success("Department fetched successfully", response);
    }

    @GetMapping("/name/{departmentName}")
    public ApiResponse getDepartmentByName(@PathVariable String departmentName) {
        DepartmentResponse response = departmentService.getDepartmentByName(departmentName);
        return ApiResponse.success("Department fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.updateDepartment(id, request);
        return ApiResponse.success("Department updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ApiResponse.success("Department deleted successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getDepartmentsByOrganization(@PathVariable Long orgId) {
        List<DepartmentResponse> departments = departmentService.getDepartmentsByOrganization(orgId);
        return ApiResponse.success("Departments fetched successfully", departments);
    }

    @GetMapping
    public ApiResponse getAllDepartments() {
        List<DepartmentResponse> departments = departmentService.getAllDepartments();
        return ApiResponse.success("All departments fetched successfully", departments);
    }
}