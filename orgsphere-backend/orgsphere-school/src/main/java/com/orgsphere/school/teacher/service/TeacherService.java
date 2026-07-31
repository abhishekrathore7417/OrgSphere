package com.orgsphere.school.teacher.service;

import com.orgsphere.school.teacher.dto.TeacherRequest;
import com.orgsphere.school.teacher.dto.TeacherResponse;

import java.util.List;

public interface TeacherService {

    TeacherResponse createTeacher(TeacherRequest request);

    TeacherResponse getTeacher(Long id);

    TeacherResponse getTeacherByTeacherId(String teacherId);

    TeacherResponse getTeacherByUserId(Long userId);

    TeacherResponse updateTeacher(Long id, TeacherRequest request);

    void deleteTeacher(Long id);

    List<TeacherResponse> getTeachersByOrganization(Long organizationId);

    List<TeacherResponse> getTeachersBySpecialization(Long organizationId, String specialization);

    List<TeacherResponse> getAllTeachers();
}