package com.orgsphere.company.department.repository;

import com.orgsphere.company.department.entity.Department;
import com.orgsphere.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentName(String departmentName);

    List<Department> findByOrganization(Organization organization);

    boolean existsByDepartmentName(String departmentName);

    boolean existsByDepartmentNameAndOrganization(String departmentName, Organization organization);
}