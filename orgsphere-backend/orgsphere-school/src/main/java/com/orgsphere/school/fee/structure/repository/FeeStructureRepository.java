package com.orgsphere.school.fee.structure.repository;

import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.fee.structure.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByOrganization(Organization organization);
    List<FeeStructure> findByOrganizationAndIsActive(Organization organization, Boolean isActive);
}
