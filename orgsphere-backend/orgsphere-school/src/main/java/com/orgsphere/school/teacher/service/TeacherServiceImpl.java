package com.orgsphere.school.teacher.service;

import com.orgsphere.common.enums.TeacherStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.teacher.dto.TeacherRequest;
import com.orgsphere.school.teacher.dto.TeacherResponse;
import com.orgsphere.school.teacher.entity.Teacher;
import com.orgsphere.school.teacher.repository.TeacherRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    public TeacherResponse createTeacher(TeacherRequest request) {

        if (teacherRepository.existsByTeacherId(request.getTeacherId())) {
            throw new BadRequestException("Teacher ID already exists: " + request.getTeacherId());
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Teacher teacher = Teacher.builder()
                .teacherId(request.getTeacherId())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .joiningDate(request.getJoiningDate())
                .status(request.getStatus() != null ?
                        TeacherStatus.valueOf(request.getStatus().toUpperCase()) :
                        TeacherStatus.ACTIVE)
                .user(user)
                .organization(organization)
                .build();

        Teacher savedTeacher = teacherRepository.save(teacher);
        return mapToResponse(savedTeacher);
    }

    @Override
    public TeacherResponse getTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return mapToResponse(teacher);
    }

    @Override
    public TeacherResponse getTeacherByTeacherId(String teacherId) {
        Teacher teacher = teacherRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));
        return mapToResponse(teacher);
    }

    @Override
    public TeacherResponse getTeacherByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user: " + userId));
        return mapToResponse(teacher);
    }

    @Override
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        teacher.setSpecialization(request.getSpecialization());
        teacher.setQualification(request.getQualification());
        teacher.setExperienceYears(request.getExperienceYears());

        if (request.getStatus() != null) {
            teacher.setStatus(TeacherStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Teacher updatedTeacher = teacherRepository.save(teacher);
        return mapToResponse(updatedTeacher);
    }

    @Override
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        teacher.setStatus(TeacherStatus.TERMINATED);
        teacherRepository.save(teacher);
    }

    @Override
    public List<TeacherResponse> getTeachersByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return teacherRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeacherResponse> getTeachersBySpecialization(Long organizationId, String specialization) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return teacherRepository.findByOrganizationAndSpecialization(organization, specialization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .teacherId(teacher.getTeacherId())
                .specialization(teacher.getSpecialization())
                .qualification(teacher.getQualification())
                .experienceYears(teacher.getExperienceYears())
                .joiningDate(teacher.getJoiningDate())
                .status(teacher.getStatus().name())
                .userId(teacher.getUser().getId())
                .userFullName(teacher.getUser().getFullName())
                .userEmail(teacher.getUser().getEmail())
                .organizationId(teacher.getOrganization().getId())
                .organizationName(teacher.getOrganization().getOrganizationName())
                .build();
    }
}