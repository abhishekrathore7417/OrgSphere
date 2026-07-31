package com.orgsphere.company.employee.service;

import com.orgsphere.common.enums.EmploymentStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.company.employee.dto.EmployeeRequest;
import com.orgsphere.company.employee.dto.EmployeeResponse;
import com.orgsphere.company.employee.entity.Employee;
import com.orgsphere.company.employee.repository.EmployeeRepository;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists: " + request.getEmployeeId());
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Employee employee = Employee.builder()
                .employeeId(request.getEmployeeId())
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .joiningDate(request.getJoiningDate())
                .salary(request.getSalary())
                .status(request.getStatus() != null ?
                        EmploymentStatus.valueOf(request.getStatus().toUpperCase()) :
                        EmploymentStatus.ACTIVE)
                .user(user)
                .organization(organization)
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponse(savedEmployee);
    }

    @Override
    public EmployeeResponse getEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Override
    public EmployeeResponse getEmployeeByEmployeeId(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        return mapToResponse(employee);
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setDesignation(request.getDesignation());
        employee.setDepartment(request.getDepartment());
        employee.setSalary(request.getSalary());

        if (request.getStatus() != null) {
            employee.setStatus(EmploymentStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employee.setStatus(EmploymentStatus.TERMINATED);
        employeeRepository.save(employee);
    }

    @Override
    public List<EmployeeResponse> getEmployeesByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return employeeRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeResponse> getEmployeesByDepartment(Long organizationId, String department) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return employeeRepository.findByOrganizationAndDepartment(organization, department)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .designation(employee.getDesignation())
                .department(employee.getDepartment())
                .joiningDate(employee.getJoiningDate())
                .salary(employee.getSalary())
                .status(employee.getStatus().name())
                .userId(employee.getUser().getId())
                .userFullName(employee.getUser().getFullName())
                .userEmail(employee.getUser().getEmail())
                .organizationId(employee.getOrganization().getId())
                .organizationName(employee.getOrganization().getOrganizationName())
                .build();
    }
}