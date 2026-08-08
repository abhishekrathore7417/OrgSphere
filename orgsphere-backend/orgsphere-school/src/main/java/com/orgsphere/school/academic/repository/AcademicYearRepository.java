package com.orgsphere.school.academic.repository;

import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.academic.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    List<AcademicYear> findByOrganization(Organization organization);
    Optional<AcademicYear> findByOrganizationAndIsCurrent(Organization organization, Boolean isCurrent);
}
