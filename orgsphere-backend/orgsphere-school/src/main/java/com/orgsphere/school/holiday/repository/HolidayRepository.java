package com.orgsphere.school.holiday.repository;

import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.holiday.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByOrganizationOrderByDateAsc(Organization organization);
}
