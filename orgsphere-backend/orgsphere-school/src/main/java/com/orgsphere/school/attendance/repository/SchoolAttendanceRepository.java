package com.orgsphere.school.attendance.repository;

import com.orgsphere.school.attendance.entity.SchoolAttendance;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolAttendanceRepository extends JpaRepository<SchoolAttendance, Long> {
    Optional<SchoolAttendance> findByStudentAndAttendanceDate(Student student, LocalDate date);
    List<SchoolAttendance> findByStudent(Student student);
    List<SchoolAttendance> findByOrganization(Organization organization);
    List<SchoolAttendance> findByOrganizationAndAttendanceDate(Organization organization, LocalDate date);
    // For classroom filtering (optional)
    List<SchoolAttendance> findByStudent_Classroom_Id(Long classroomId);
    List<SchoolAttendance> findByStudent_Classroom_IdAndAttendanceDate(Long classroomId, LocalDate date);
}