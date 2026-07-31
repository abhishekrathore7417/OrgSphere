package com.orgsphere.school.fee.service;

import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.common.enums.RoleType;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.fee.dto.FeeRequest;
import com.orgsphere.school.fee.dto.FeeResponse;
import com.orgsphere.school.fee.entity.Fee;
import com.orgsphere.school.fee.repository.FeeRepository;
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
public class FeeServiceImpl implements FeeService {

    private final FeeRepository feeRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public FeeResponse createFee(FeeRequest request) {

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getRole() != RoleType.STUDENT) {
            throw new BadRequestException("Provided user is not a student");
        }

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Fee fee = Fee.builder()
                .feeType(request.getFeeType())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .paidDate(request.getPaidDate())
                .paidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0)
                .remainingAmount(request.getAmount() - (request.getPaidAmount() != null ? request.getPaidAmount() : 0.0))
                .penalty(request.getPenalty())
                .description(request.getDescription())
                .status(request.getStatus() != null ?
                        FeeStatus.valueOf(request.getStatus().toUpperCase()) :
                        FeeStatus.PENDING)
                .student(student)
                .organization(organization)
                .build();

        Fee savedFee = feeRepository.save(fee);
        return mapToResponse(savedFee);
    }

    @Override
    public FeeResponse getFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));
        return mapToResponse(fee);
    }

    @Override
    public FeeResponse updateFee(Long id, FeeRequest request) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));

        fee.setFeeType(request.getFeeType());
        fee.setAmount(request.getAmount());
        fee.setDueDate(request.getDueDate());
        fee.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            fee.setStatus(FeeStatus.valueOf(request.getStatus().toUpperCase()));
        }

        Fee updatedFee = feeRepository.save(fee);
        return mapToResponse(updatedFee);
    }

    @Override
    public void deleteFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));
        fee.setStatus(FeeStatus.WAIVED);
        feeRepository.save(fee);
    }

    @Override
    public FeeResponse payFee(Long id, Double amount) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));

        if (fee.getStatus() == FeeStatus.PAID) {
            throw new BadRequestException("Fee already paid");
        }

        double paidAmount = fee.getPaidAmount() + amount;
        double remainingAmount = fee.getAmount() - paidAmount;

        fee.setPaidDate(LocalDate.now());
        fee.setPaidAmount(paidAmount);
        fee.setRemainingAmount(remainingAmount);

        if (remainingAmount <= 0) {
            fee.setStatus(FeeStatus.PAID);
            fee.setRemainingAmount(0.0);
        } else if (paidAmount > 0) {
            fee.setStatus(FeeStatus.PARTIAL);
        }

        Fee updatedFee = feeRepository.save(fee);
        return mapToResponse(updatedFee);
    }

    @Override
    public FeeResponse waiveFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));

        fee.setStatus(FeeStatus.WAIVED);
        fee.setRemainingAmount(0.0);

        Fee waivedFee = feeRepository.save(fee);
        return mapToResponse(waivedFee);
    }

    @Override
    public List<FeeResponse> getFeesByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return feeRepository.findByStudent(student)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeResponse> getFeesByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return feeRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeResponse> getPendingFees(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return feeRepository.findByOrganizationAndStatus(organization, FeeStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeResponse> getOverdueFees(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return feeRepository.findByDueDateBeforeAndStatusNot(LocalDate.now(), FeeStatus.PAID)
                .stream()
                .filter(fee -> fee.getOrganization().getId().equals(organizationId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeResponse> getFeesByDateRange(Long organizationId, LocalDate start, LocalDate end) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        return feeRepository.findByOrganizationAndDueDateBetween(organization, start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FeeResponse mapToResponse(Fee fee) {
        return FeeResponse.builder()
                .id(fee.getId())
                .feeType(fee.getFeeType())
                .amount(fee.getAmount())
                .dueDate(fee.getDueDate())
                .paidDate(fee.getPaidDate())
                .paidAmount(fee.getPaidAmount())
                .remainingAmount(fee.getRemainingAmount())
                .penalty(fee.getPenalty())
                .description(fee.getDescription())
                .status(fee.getStatus().name())
                .studentId(fee.getStudent().getId())
                .studentName(fee.getStudent().getFullName())
                .studentEmail(fee.getStudent().getEmail())
                .organizationId(fee.getOrganization().getId())
                .organizationName(fee.getOrganization().getOrganizationName())
                .build();
    }
}