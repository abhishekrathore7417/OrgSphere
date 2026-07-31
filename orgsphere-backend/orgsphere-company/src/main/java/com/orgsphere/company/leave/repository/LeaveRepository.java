package com.orgsphere.company.leave.repository;

import com.orgsphere.company.leave.entity.Leave;
import com.orgsphere.common.enums.LeaveStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByUser(User user);

    List<Leave> findByOrganization(Organization organization);

    List<Leave> findByOrganizationAndStatus(Organization organization, LeaveStatus status);

    List<Leave> findByUserAndStatus(User user, LeaveStatus status);

    List<Leave> findByUserAndStartDateBetween(User user, LocalDate start, LocalDate end);
}