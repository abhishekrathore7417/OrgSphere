package com.orgsphere.company.attendance.repository;

import com.orgsphere.company.attendance.entity.Attendance;
import com.orgsphere.common.enums.AttendanceStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUser(User user);

    List<Attendance> findByOrganization(Organization organization);

    List<Attendance> findByUserAndAttendanceDateBetween(User user, LocalDate start, LocalDate end);

    List<Attendance> findByOrganizationAndAttendanceDate(Organization organization, LocalDate date);

    List<Attendance> findByOrganizationAndStatus(Organization organization, AttendanceStatus status);

    Optional<Attendance> findByUserAndAttendanceDate(User user, LocalDate date);
}