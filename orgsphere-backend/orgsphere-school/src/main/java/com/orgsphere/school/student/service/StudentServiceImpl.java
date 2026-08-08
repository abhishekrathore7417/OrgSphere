package com.orgsphere.school.student.service;

import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.student.dto.StudentRequest;
import com.orgsphere.school.student.dto.StudentResponse;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.school.student.repository.StudentRepository;
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
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    public StudentResponse createStudent(StudentRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check uniqueness within same organization only (not globally)
        if (studentRepository.existsByStudentIdAndOrganization(request.getStudentId(), organization)) {
            throw new BadRequestException("Student ID already exists in this organization: " + request.getStudentId());
        }

        Student student = Student.builder()
                .studentId(request.getStudentId())
                .admissionDate(request.getAdmissionDate())
                .className(request.getClassName())
                .section(request.getSection())
                .rollNumber(request.getRollNumber())
                .guardianName(request.getGuardianName())
                .guardianContact(request.getGuardianContact())
                .guardianEmail(request.getGuardianEmail())
                .optionalFeeTypes(request.getOptionalFeeTypes())
                .status(request.getStatus() != null ?
                        StudentStatus.valueOf(request.getStatus().toUpperCase()) :
                        StudentStatus.ACTIVE)
                .user(user)
                .organization(organization)
                .build();

        Student savedStudent = studentRepository.save(student);
        return mapToResponse(savedStudent);
    }

    @Override
    public StudentResponse getStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    @Override
    public StudentResponse getStudentByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return mapToResponse(student);
    }

    @Override
    public StudentResponse getStudentByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + userId));
        return mapToResponse(student);
    }

    @Override
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        student.setClassName(request.getClassName());
        student.setSection(request.getSection());
        student.setRollNumber(request.getRollNumber());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianContact(request.getGuardianContact());
        student.setGuardianEmail(request.getGuardianEmail());
        student.setOptionalFeeTypes(request.getOptionalFeeTypes());

        if (request.getStatus() != null) {
            student.setStatus(StudentStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Student updatedStudent = studentRepository.save(student);
        return mapToResponse(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        student.setStatus(StudentStatus.DROPPED);
        studentRepository.save(student);
    }

    @Override
    public List<StudentResponse> getStudentsByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return studentRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentResponse> getStudentsByClass(Long organizationId, String className) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return studentRepository.findByOrganizationAndClassName(organization, className)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentResponse> getStudentsByClassAndSection(Long organizationId, String className, String section) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return studentRepository.findByOrganizationAndClassNameAndSection(organization, className, section)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .studentId(student.getStudentId())
                .admissionDate(student.getAdmissionDate())
                .className(student.getClassName())
                .section(student.getSection())
                .rollNumber(student.getRollNumber())
                .guardianName(student.getGuardianName())
                .guardianContact(student.getGuardianContact())
                .guardianEmail(student.getGuardianEmail())
                .optionalFeeTypes(student.getOptionalFeeTypes())
                .status(student.getStatus().name())
                .userId(student.getUser().getId())
                .userFullName(student.getUser().getFullName())
                .userEmail(student.getUser().getEmail())
                .organizationId(student.getOrganization().getId())
                .organizationName(student.getOrganization().getOrganizationName())
                .build();
    }
}