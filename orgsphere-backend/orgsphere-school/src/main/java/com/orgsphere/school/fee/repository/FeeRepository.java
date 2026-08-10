package com.orgsphere.school.fee.repository;

import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.fee.entity.Fee;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudent(User student);

    List<Fee> findByOrganization(Organization organization);

    List<Fee> findByOrganizationAndStatus(Organization organization, FeeStatus status);

    List<Fee> findByStudentAndStatus(User student, FeeStatus status);

    // ✅ USE THIS for overdue (exclude PAID and WAIVED)
    @Query("SELECT f FROM Fee f WHERE f.dueDate < :date AND f.status NOT IN (:status1, :status2)")
    List<Fee> findOverdueFees(@Param("date") LocalDate date,
                              @Param("status1") FeeStatus status1,
                              @Param("status2") FeeStatus status2);

    // ✅ OPTIMIZED: Overdue by organization
    @Query("SELECT f FROM Fee f WHERE f.organization = :org AND f.dueDate < :date AND f.status NOT IN (:status1, :status2)")
    List<Fee> findOverdueFeesByOrganization(@Param("org") Organization org,
                                            @Param("date") LocalDate date,
                                            @Param("status1") FeeStatus status1,
                                            @Param("status2") FeeStatus status2);

    // ✅ For duplicate check
    boolean existsByStudentAndFeeTypeAndDueDate(User student, String feeType, LocalDate dueDate);

    List<Fee> findByOrganizationAndDueDateBetween(Organization organization, LocalDate start, LocalDate end);
}