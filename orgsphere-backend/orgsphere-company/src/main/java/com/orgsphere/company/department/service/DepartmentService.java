package com.orgsphere.company.department.service;

import com.orgsphere.company.department.dto.DepartmentRequest;
import com.orgsphere.company.department.dto.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse createDepartment(DepartmentRequest request);

    DepartmentResponse getDepartment(Long id);

    DepartmentResponse getDepartmentByName(String departmentName);

    DepartmentResponse updateDepartment(Long id, DepartmentRequest request);

    void deleteDepartment(Long id);

    List<DepartmentResponse> getDepartmentsByOrganization(Long organizationId);

    List<DepartmentResponse> getAllDepartments();
}