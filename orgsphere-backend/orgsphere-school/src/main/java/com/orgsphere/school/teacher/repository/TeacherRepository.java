package com.orgsphere.school.teacher.repository;

import com.orgsphere.common.enums.TeacherStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.teacher.entity.Teacher;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByTeacherId(String teacherId);

    Optional<Teacher> findByUser(User user);

    List<Teacher> findByOrganization(Organization organization);

    List<Teacher> findByOrganizationAndStatus(Organization organization, TeacherStatus status);

    List<Teacher> findByOrganizationAndSpecialization(Organization organization, String specialization);

    boolean existsByTeacherId(String teacherId);
}