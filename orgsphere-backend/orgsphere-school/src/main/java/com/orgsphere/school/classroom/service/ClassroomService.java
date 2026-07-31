package com.orgsphere.school.classroom.service;

import com.orgsphere.school.classroom.dto.ClassroomRequest;
import com.orgsphere.school.classroom.dto.ClassroomResponse;

import java.util.List;

public interface ClassroomService {

    ClassroomResponse createClassroom(ClassroomRequest request);

    ClassroomResponse getClassroom(Long id);

    ClassroomResponse getClassroomByCode(String classCode);

    ClassroomResponse getClassroomByName(String classroomName);

    ClassroomResponse updateClassroom(Long id, ClassroomRequest request);

    void deleteClassroom(Long id);

    List<ClassroomResponse> getClassroomsByOrganization(Long organizationId);

    List<ClassroomResponse> getClassroomsByTeacher(Long teacherId);

    List<ClassroomResponse> getAllClassrooms();
}