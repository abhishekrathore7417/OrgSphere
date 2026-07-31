package com.orgsphere.company.attendance.service;

import com.orgsphere.common.enums.AttendanceStatus;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.company.attendance.dto.AttendanceRequest;
import com.orgsphere.company.attendance.dto.AttendanceResponse;
import com.orgsphere.company.attendance.entity.Attendance;
import com.orgsphere.company.attendance.repository.AttendanceRepository;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public AttendanceResponse markAttendance(AttendanceRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check if attendance already marked for today
        if (attendanceRepository.findByUserAndAttendanceDate(user, request.getAttendanceDate()).isPresent()) {
            throw new BadRequestException("Attendance already marked for this date");
        }

        Attendance attendance = Attendance.builder()
                .attendanceDate(request.getAttendanceDate())
                .checkInTime(request.getCheckInTime() != null ? request.getCheckInTime() : LocalTime.now())
                .checkOutTime(request.getCheckOutTime())
                .status(AttendanceStatus.valueOf(request.getStatus().toUpperCase()))
                .remarks(request.getRemarks())
                .user(user)
                .organization(organization)
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(savedAttendance);
    }

    @Override
    public AttendanceResponse getAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return mapToResponse(attendance);
    }

    @Override
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));

        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(AttendanceStatus.valueOf(request.getStatus().toUpperCase()));
        attendance.setRemarks(request.getRemarks());

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(updatedAttendance);
    }

    @Override
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        attendanceRepository.delete(attendance);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return attendanceRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return attendanceRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByDate(Long organizationId, LocalDate date) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return attendanceRepository.findByOrganizationAndAttendanceDate(organization, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceResponse getTodayAttendance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Attendance attendance = attendanceRepository.findByUserAndAttendanceDate(user, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No attendance found for today"));

        return mapToResponse(attendance);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByUserAndDateRange(Long userId, LocalDate start, LocalDate end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        return attendanceRepository.findByUserAndAttendanceDateBetween(user, start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .remarks(attendance.getRemarks())
                .userId(attendance.getUser().getId())
                .userFullName(attendance.getUser().getFullName())
                .userEmail(attendance.getUser().getEmail())
                .organizationId(attendance.getOrganization().getId())
                .organizationName(attendance.getOrganization().getOrganizationName())
                .build();
    }
}