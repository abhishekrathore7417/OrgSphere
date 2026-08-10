package com.orgsphere.school.student.repository;

import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.classroom.entity.Classroom;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    Optional<Student> findByUser(User user);

    List<Student> findByOrganization(Organization organization);

    List<Student> findByOrganizationAndStatus(Organization organization, StudentStatus status);

    List<Student> findByOrganizationAndClassName(Organization organization, String className);

    List<Student> findByOrganizationAndClassNameAndSection(Organization organization, String className, String section);

    boolean existsByStudentId(String studentId);

    // org-level unique — same studentId allowed in different organizations
    boolean existsByStudentIdAndOrganization(String studentId, Organization organization);

    // session-aware: same studentId allowed in different sessions (different className = different session)
    boolean existsByStudentIdAndOrganizationAndClassName(String studentId, Organization organization, String className);
    // Fetch students by className AND session — prevents cross-session data leak
    List<Student> findByOrganizationAndClassNameAndSession(Organization organization, String className, String session);
    List<Student> findByClassroomId(Long classroomId);
    List<Student> findByClassroomAndStatus(Classroom classroom, StudentStatus status);

}