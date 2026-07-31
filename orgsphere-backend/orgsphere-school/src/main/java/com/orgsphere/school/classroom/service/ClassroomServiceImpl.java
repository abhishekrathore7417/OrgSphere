package com.orgsphere.school.classroom.service;

import com.orgsphere.common.enums.ClassroomStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.classroom.dto.ClassroomRequest;
import com.orgsphere.school.classroom.dto.ClassroomResponse;
import com.orgsphere.school.classroom.entity.Classroom;
import com.orgsphere.school.classroom.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public ClassroomResponse createClassroom(ClassroomRequest request) {

        if (classroomRepository.existsByClassCode(request.getClassCode())) {
            throw new BadRequestException("Class code already exists: " + request.getClassCode());
        }

        if (classroomRepository.existsByClassroomName(request.getClassroomName())) {
            throw new BadRequestException("Classroom name already exists: " + request.getClassroomName());
        }

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Classroom classroom = Classroom.builder()
                .classroomName(request.getClassroomName())
                .classCode(request.getClassCode())
                .section(request.getSection())
                .capacity(request.getCapacity())
                .classTeacher(request.getClassTeacher())
                .classTeacherId(request.getClassTeacherId())
                .status(request.getStatus() != null ?
                        ClassroomStatus.valueOf(request.getStatus().toUpperCase()) :
                        ClassroomStatus.ACTIVE)
                .organization(organization)
                .build();

        Classroom savedClassroom = classroomRepository.save(classroom);
        return mapToResponse(savedClassroom);
    }

    @Override
    public ClassroomResponse getClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with id: " + id));
        return mapToResponse(classroom);
    }

    @Override
    public ClassroomResponse getClassroomByCode(String classCode) {
        Classroom classroom = classroomRepository.findByClassCode(classCode)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with code: " + classCode));
        return mapToResponse(classroom);
    }

    @Override
    public ClassroomResponse getClassroomByName(String classroomName) {
        Classroom classroom = classroomRepository.findByClassroomName(classroomName)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found: " + classroomName));
        return mapToResponse(classroom);
    }

    @Override
    public ClassroomResponse updateClassroom(Long id, ClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with id: " + id));

        classroom.setClassroomName(request.getClassroomName());
        classroom.setSection(request.getSection());
        classroom.setCapacity(request.getCapacity());
        classroom.setClassTeacher(request.getClassTeacher());
        classroom.setClassTeacherId(request.getClassTeacherId());

        if (request.getStatus() != null) {
            classroom.setStatus(ClassroomStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Classroom updatedClassroom = classroomRepository.save(classroom);
        return mapToResponse(updatedClassroom);
    }

    @Override
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with id: " + id));
        classroom.setStatus(ClassroomStatus.INACTIVE);
        classroomRepository.save(classroom);
    }

    @Override
    public List<ClassroomResponse> getClassroomsByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return classroomRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomResponse> getClassroomsByTeacher(Long teacherId) {
        return classroomRepository.findByClassTeacherId(teacherId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomResponse> getAllClassrooms() {
        return classroomRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ClassroomResponse mapToResponse(Classroom classroom) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .classroomName(classroom.getClassroomName())
                .classCode(classroom.getClassCode())
                .section(classroom.getSection())
                .capacity(classroom.getCapacity())
                .classTeacher(classroom.getClassTeacher())
                .classTeacherId(classroom.getClassTeacherId())
                .status(classroom.getStatus().name())
                .organizationId(classroom.getOrganization().getId())
                .organizationName(classroom.getOrganization().getOrganizationName())
                .build();
    }
}