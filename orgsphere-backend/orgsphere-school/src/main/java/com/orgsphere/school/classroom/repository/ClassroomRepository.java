package com.orgsphere.school.classroom.repository;

import com.orgsphere.common.enums.ClassroomStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.classroom.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByClassCode(String classCode);

    Optional<Classroom> findByClassroomName(String classroomName);

    List<Classroom> findByOrganization(Organization organization);

    List<Classroom> findByOrganizationAndStatus(Organization organization, ClassroomStatus status);

    List<Classroom> findByClassTeacherId(Long teacherId);

    boolean existsByClassCode(String classCode);

    boolean existsByClassroomName(String classroomName);
}