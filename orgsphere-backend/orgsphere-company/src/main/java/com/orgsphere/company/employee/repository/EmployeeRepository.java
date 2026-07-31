package com.orgsphere.company.employee.repository;

import com.orgsphere.company.employee.entity.Employee;
import com.orgsphere.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeId(String employeeId);

    List<Employee> findByOrganization(Organization organization);

    List<Employee> findByOrganizationAndDepartment(Organization organization, String department);


    boolean existsByEmployeeId(String employeeId);

}