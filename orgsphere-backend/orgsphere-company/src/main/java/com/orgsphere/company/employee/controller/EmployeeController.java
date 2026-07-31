package com.orgsphere.company.employee.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.company.employee.dto.EmployeeRequest;
import com.orgsphere.company.employee.dto.EmployeeResponse;
import com.orgsphere.company.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ApiResponse createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ApiResponse.success("Employee created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getEmployee(@PathVariable Long id) {
        EmployeeResponse response = employeeService.getEmployee(id);
        return ApiResponse.success("Employee fetched successfully", response);
    }

    @GetMapping("/employee-id/{employeeId}")
    public ApiResponse getEmployeeByEmployeeId(@PathVariable String employeeId) {
        EmployeeResponse response = employeeService.getEmployeeByEmployeeId(employeeId);
        return ApiResponse.success("Employee fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ApiResponse.success("Employee updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ApiResponse.success("Employee terminated successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getEmployeesByOrganization(@PathVariable Long orgId) {
        List<EmployeeResponse> employees = employeeService.getEmployeesByOrganization(orgId);
        return ApiResponse.success("Employees fetched successfully", employees);
    }

    @GetMapping("/organization/{orgId}/department/{department}")
    public ApiResponse getEmployeesByDepartment(@PathVariable Long orgId, @PathVariable String department) {
        List<EmployeeResponse> employees = employeeService.getEmployeesByDepartment(orgId, department);
        return ApiResponse.success("Employees fetched successfully", employees);
    }

    @GetMapping
    public ApiResponse getAllEmployees() {
        List<EmployeeResponse> employees = employeeService.getAllEmployees();
        return ApiResponse.success("All employees fetched successfully", employees);
    }
}