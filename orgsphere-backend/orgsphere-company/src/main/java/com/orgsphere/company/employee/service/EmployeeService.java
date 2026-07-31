package com.orgsphere.company.employee.service;

import com.orgsphere.company.employee.dto.EmployeeRequest;
import com.orgsphere.company.employee.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse getEmployee(Long id);

    EmployeeResponse getEmployeeByEmployeeId(String employeeId);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);

    List<EmployeeResponse> getEmployeesByOrganization(Long organizationId);

    List<EmployeeResponse> getEmployeesByDepartment(Long organizationId, String department);

    List<EmployeeResponse> getAllEmployees();
}