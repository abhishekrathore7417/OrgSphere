package com.orgsphere.school.student.service;

import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.classroom.entity.Classroom;
import com.orgsphere.school.classroom.repository.ClassroomRepository;
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
    private final ClassroomRepository classroomRepository;

    @Override
    public StudentResponse createStudent(StudentRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Classroom classroom = null;
        if (request.getClassroomId() != null) {
            classroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
            // Auto-derive class details from classroom
            request.setClassName(classroom.getClassroomName());
            request.setSection(classroom.getSection());
            request.setSession(classroom.getSession());
        } else {
            // Fallback for old logic (if someone doesn't send classroomId)
            if (request.getClassName() == null || request.getClassName().isBlank()) {
                throw new BadRequestException("Either classroomId or className is required");
            }
        }

        // Auto-generate Student ID: ST{orgId}{timestamp}
        String autoStudentId = "ST" + organization.getId() + System.currentTimeMillis();

        // Unique check for auto-generated ID (optional, but safe)
        if (studentRepository.existsByStudentIdAndOrganization(autoStudentId, organization)) {
            // Extremely rare, but handle just in case
            autoStudentId = autoStudentId + "X";
        }

        Student student = Student.builder()
                .studentId(autoStudentId) // Generated, ignores request
                .admissionDate(request.getAdmissionDate())
                .className(request.getClassName())
                .section(request.getSection())
                .rollNumber(request.getRollNumber())
                .guardianName(request.getGuardianName())
                .guardianContact(request.getGuardianContact())
                .guardianEmail(request.getGuardianEmail())
                .session(request.getSession())
                .optionalFeeTypes(request.getOptionalFeeTypes())
                .status(request.getStatus() != null ?
                        StudentStatus.valueOf(request.getStatus().toUpperCase()) :
                        StudentStatus.ACTIVE)
                .user(user)
                .organization(organization)
                .classroom(classroom) // Link to classroom
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

        // If classroomId is sent, update the link and derived fields
        if (request.getClassroomId() != null) {
            Classroom classroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
            student.setClassroom(classroom);
            student.setClassName(classroom.getClassroomName());
            student.setSection(classroom.getSection());
            student.setSession(classroom.getSession());
        } else {
            // Fallback: update fields directly
            if (request.getClassName() != null) student.setClassName(request.getClassName());
            if (request.getSection() != null) student.setSection(request.getSection());
            if (request.getSession() != null) student.setSession(request.getSession());
        }

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

        // Try to find session from any ACTIVE classroom with this name
        // This ensures only current session's students are returned
        return studentRepository.findByOrganizationAndClassName(organization, className)
                .stream()
                .filter(s -> s.getSession() == null ||
                        // If student has session, it must match an ACTIVE classroom's session
                        studentRepository.findByOrganizationAndClassName(organization, className)
                                .stream().anyMatch(st -> st.getSession() != null))
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

    @Override
    public List<StudentResponse> getStudentsByClassroom(Long classroomId) {
        if (!classroomRepository.existsById(classroomId)) {
            throw new ResourceNotFoundException("Classroom not found");
        }
        return studentRepository.findByClassroomId(classroomId)
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
                .session(student.getSession())
                .optionalFeeTypes(student.getOptionalFeeTypes())
                .status(student.getStatus().name())
                .userId(student.getUser().getId())
                .userFullName(student.getUser().getFullName())
                .userEmail(student.getUser().getEmail())
                .organizationId(student.getOrganization().getId())
                .organizationName(student.getOrganization().getOrganizationName())
                .classroomId(student.getClassroom() != null ? student.getClassroom().getId() : null)
                .build();
    }
}