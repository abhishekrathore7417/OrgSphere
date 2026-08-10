package com.orgsphere.school.attendance.service.impl;

import com.orgsphere.common.enums.AttendanceStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.attendance.dto.SchoolAttendanceRequest;
import com.orgsphere.school.attendance.dto.SchoolAttendanceResponse;
import com.orgsphere.school.attendance.entity.SchoolAttendance;
import com.orgsphere.school.attendance.repository.SchoolAttendanceRepository;
import com.orgsphere.school.attendance.service.SchoolAttendanceService;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.school.student.repository.StudentRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SchoolAttendanceServiceImpl implements SchoolAttendanceService {

    private final SchoolAttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public SchoolAttendanceResponse markAttendance(SchoolAttendanceRequest request) {
        // Find user and then student
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for this user"));

        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check duplicate (same student, same date)
        if (attendanceRepository.findByStudentAndAttendanceDate(student, request.getAttendanceDate()).isPresent()) {
            throw new BadRequestException("Attendance already marked for this student on this date");
        }

        SchoolAttendance attendance = SchoolAttendance.builder()
                .attendanceDate(request.getAttendanceDate())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(AttendanceStatus.valueOf(request.getStatus().toUpperCase()))
                .remarks(request.getRemarks())
                .student(student)
                .organization(org)
                .build();

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    public SchoolAttendanceResponse updateAttendance(Long id, SchoolAttendanceRequest request) {
        SchoolAttendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));

        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(AttendanceStatus.valueOf(request.getStatus().toUpperCase()));
        attendance.setRemarks(request.getRemarks());

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }

    @Override
    public List<SchoolAttendanceResponse> getAttendanceByOrganization(Long organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return attendanceRepository.findByOrganization(org)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SchoolAttendanceResponse> getAttendanceByDate(Long organizationId, LocalDate date) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return attendanceRepository.findByOrganizationAndAttendanceDate(org, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SchoolAttendanceResponse> getAttendanceByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return attendanceRepository.findByStudent(student)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SchoolAttendanceResponse> getAttendanceByClassroom(Long classroomId) {
        return attendanceRepository.findByStudent_Classroom_Id(classroomId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SchoolAttendanceResponse mapToResponse(SchoolAttendance attendance) {
        return SchoolAttendanceResponse.builder()
                .id(attendance.getId())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .remarks(attendance.getRemarks())
                .userId(attendance.getStudent().getUser().getId())  // Important: frontend expects userId
                .userFullName(attendance.getStudent().getUser().getFullName())
                .userEmail(attendance.getStudent().getUser().getEmail())
                .organizationId(attendance.getOrganization().getId())
                .organizationName(attendance.getOrganization().getOrganizationName())
                .build();
    }
}