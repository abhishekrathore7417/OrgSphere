package com.orgsphere.school.fee.repository;

import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.fee.entity.Fee;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudent(User student);

    List<Fee> findByOrganization(Organization organization);

    List<Fee> findByOrganizationAndStatus(Organization organization, FeeStatus status);

    List<Fee> findByStudentAndStatus(User student, FeeStatus status);

    List<Fee> findByDueDateBeforeAndStatusNot(LocalDate date, FeeStatus status);

    List<Fee> findByOrganizationAndDueDateBetween(Organization organization, LocalDate start, LocalDate end);
}