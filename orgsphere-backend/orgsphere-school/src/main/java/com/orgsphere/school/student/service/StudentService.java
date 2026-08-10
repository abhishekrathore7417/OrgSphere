package com.orgsphere.school.student.service;

import com.orgsphere.school.student.dto.StudentRequest;
import com.orgsphere.school.student.dto.StudentResponse;

import java.util.List;

public interface StudentService {

    StudentResponse createStudent(StudentRequest request);

    StudentResponse getStudent(Long id);

    StudentResponse getStudentByStudentId(String studentId);

    StudentResponse getStudentByUserId(Long userId);

    StudentResponse updateStudent(Long id, StudentRequest request);

    void deleteStudent(Long id);

    List<StudentResponse> getStudentsByOrganization(Long organizationId);

    List<StudentResponse> getStudentsByClass(Long organizationId, String className);

    List<StudentResponse> getStudentsByClassAndSection(Long organizationId, String className, String section);

    List<StudentResponse> getAllStudents();
    List<StudentResponse> getStudentsByClassroom(Long classroomId);
}