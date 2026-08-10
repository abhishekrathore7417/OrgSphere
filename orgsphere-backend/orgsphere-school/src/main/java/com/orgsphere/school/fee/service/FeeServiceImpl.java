package com.orgsphere.school.fee.service;
import com.orgsphere.school.classroom.repository.ClassroomRepository;
import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.common.enums.RoleType;
import com.orgsphere.common.exception.BadRequestException;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.classroom.entity.Classroom;
import com.orgsphere.school.fee.dto.FeeRequest;
import com.orgsphere.school.fee.dto.FeeResponse;
import com.orgsphere.school.fee.entity.Fee;
import com.orgsphere.school.fee.repository.FeeRepository;
import com.orgsphere.school.fee.structure.entity.FeeStructure;
import com.orgsphere.school.fee.structure.repository.FeeStructureRepository;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.school.student.repository.StudentRepository;
import com.orgsphere.user.entity.User;
import com.orgsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeeServiceImpl implements FeeService {

    private final FeeRepository feeRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final StudentRepository studentRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final ClassroomRepository classroomRepository;
    // needed for generateFeesForClassroom

    // ─── Create Fee ────────────────────────────────────────────────────────────
    @Override
    public FeeResponse createFee(FeeRequest request) {

        User studentUser = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (studentUser.getRole() != RoleType.STUDENT) {
            throw new BadRequestException("Provided user is not a student");
        }

        Student studentEntity = studentRepository.findByUser(studentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found for user: " + studentUser.getId()));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Classroom classroom = studentEntity.getClassroom(); // may be null

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
                .student(studentUser)
                .organization(organization)
                .classroom(classroom)
                .build();

        Fee savedFee = feeRepository.save(fee);
        return mapToResponse(savedFee);
    }

    // ─── Get single fee ─────────────────────────────────────────────────────────
    @Override
    public FeeResponse getFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));
        return mapToResponse(fee);
    }

    // ─── Update fee ─────────────────────────────────────────────────────────────
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

    // ─── Delete (soft) ──────────────────────────────────────────────────────────
    @Override
    public void deleteFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));
        fee.setStatus(FeeStatus.WAIVED);
        feeRepository.save(fee);
    }

    // ─── Pay fee (IMPROVED) ────────────────────────────────────────────────────
    @Override
    public FeeResponse payFee(Long id, Double amount) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));

        if (fee.getStatus() == FeeStatus.PAID) {
            throw new BadRequestException("Fee already paid");
        }

        // ✅ Prevent overpayment
        if (amount > fee.getRemainingAmount()) {
            throw new BadRequestException("Payment amount cannot exceed remaining due: ₹" + fee.getRemainingAmount());
        }

        double paidAmount = fee.getPaidAmount() + amount;
        double remainingAmount = fee.getRemainingAmount() - amount; // correct calculation

        fee.setPaidDate(LocalDate.now());
        fee.setPaidAmount(paidAmount);
        fee.setRemainingAmount(remainingAmount);

        if (remainingAmount <= 0) {
            fee.setStatus(FeeStatus.PAID);
            fee.setRemainingAmount(0.0);
            // ✅ Generate receipt number on full payment
            fee.setReceiptNumber(generateReceiptNumber(fee));
        } else if (paidAmount > 0) {
            fee.setStatus(FeeStatus.PARTIAL);
            // ✅ Generate receipt number even for partial payment (optional)
            fee.setReceiptNumber(generateReceiptNumber(fee));
        }

        Fee updatedFee = feeRepository.save(fee);
        return mapToResponse(updatedFee);
    }

    // ─── Waive fee ──────────────────────────────────────────────────────────────
    @Override
    public FeeResponse waiveFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));

        fee.setStatus(FeeStatus.WAIVED);
        fee.setRemainingAmount(0.0);

        Fee waivedFee = feeRepository.save(fee);
        return mapToResponse(waivedFee);
    }

    // ─── Get fees by student ───────────────────────────────────────────────────
    @Override
    public List<FeeResponse> getFeesByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return feeRepository.findByStudent(student)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get fees by organization ──────────────────────────────────────────────
    @Override
    public List<FeeResponse> getFeesByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return feeRepository.findByOrganization(organization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get pending fees ──────────────────────────────────────────────────────
    @Override
    public List<FeeResponse> getPendingFees(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return feeRepository.findByOrganizationAndStatus(organization, FeeStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get overdue fees (optimized) ─────────────────────────────────────────
    @Override
    public List<FeeResponse> getOverdueFees(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        List<Fee> overdueFees = feeRepository.findOverdueFeesByOrganization(
                organization,
                LocalDate.now(),
                FeeStatus.PAID,
                FeeStatus.WAIVED
        );

        return overdueFees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get fees by date range ────────────────────────────────────────────────
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

    // ─── NEW: Generate fees for a specific classroom ──────────────────────────
    @Override
    @Transactional
    public List<FeeResponse> generateFeesForClassroom(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        Organization org = classroom.getOrganization();

        // Fetch active fee structures for this organization
        List<FeeStructure> structures = feeStructureRepository.findByOrganizationAndIsActive(org, true);
        if (structures.isEmpty()) {
            throw new BadRequestException("No active fee structures found for this organization");
        }

        // Fetch active students of this classroom
        List<Student> students = studentRepository.findByClassroomAndStatus(classroom, StudentStatus.ACTIVE);
        if (students.isEmpty()) {
            throw new BadRequestException("No active students found in this classroom");
        }

        LocalDate today = LocalDate.now();
        List<Fee> generatedFees = new ArrayList<>();

        for (FeeStructure struct : structures) {
            LocalDate dueDate = computeNextDueDate(struct, today);
            if (dueDate == null) continue;

            for (Student student : students) {
                // Check mandatory vs optional
                if (!isFeeApplicable(student, struct)) continue;

                // Check duplicate
                boolean exists = feeRepository.existsByStudentAndFeeTypeAndDueDate(
                        student.getUser(), struct.getFeeType(), dueDate
                );
                if (exists) continue;

                // Determine status and penalty
                FeeStatus status = dueDate.isBefore(today) ? FeeStatus.OVERDUE : FeeStatus.PENDING;
                double penalty = 0.0;
                if (dueDate.isBefore(today)) {
                    Double latePct = org.getLateFeePercent() != null ? org.getLateFeePercent() : 5.0;
                    penalty = struct.getAmount() * (latePct / 100);
                }

                Fee fee = Fee.builder()
                        .feeType(struct.getFeeType())
                        .amount(struct.getAmount())
                        .dueDate(dueDate)
                        .description(struct.getDescription() != null ? struct.getDescription() : "Auto-generated " + struct.getFeeType())
                        .status(status)
                        .paidAmount(0.0)
                        .remainingAmount(struct.getAmount() + penalty)
                        .penalty(penalty)
                        .student(student.getUser())
                        .classroom(classroom)
                        .organization(org)
                        .build();

                generatedFees.add(feeRepository.save(fee));
            }
        }

        return generatedFees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Helper: compute next due date ─────────────────────────────────────────
    private LocalDate computeNextDueDate(FeeStructure struct, LocalDate refDate) {
        int day = struct.getDueDay() != null ? struct.getDueDay() : 10;
        if (day < 1) day = 1;
        if (day > 28) day = 28;

        String freq = struct.getFrequency();
        int year = refDate.getYear();
        int month = refDate.getMonthValue();

        if ("MONTHLY".equalsIgnoreCase(freq)) {
            if (refDate.getDayOfMonth() > day) {
                month++;
                if (month > 12) { month = 1; year++; }
            }
            return LocalDate.of(year, month, day);
        }
        if ("QUARTERLY".equalsIgnoreCase(freq)) {
            int currentQuarter = (month - 1) / 3;
            int dueQuarter = currentQuarter;
            if (refDate.getDayOfMonth() > day) dueQuarter++;
            if (dueQuarter > 3) { dueQuarter = 0; year++; }
            int dueMonth = dueQuarter * 3 + 1;
            if (dueMonth == 13) { dueMonth = 1; year++; }
            return LocalDate.of(year, dueMonth, day);
        }
        if ("YEARLY".equalsIgnoreCase(freq)) {
            if (refDate.getMonthValue() > 12 || (refDate.getMonthValue() == 12 && refDate.getDayOfMonth() > day)) {
                year++;
            }
            return LocalDate.of(year, 12, day);
        }
        if ("ONE_TIME".equalsIgnoreCase(freq)) {
            return LocalDate.now().plusMonths(1).withDayOfMonth(day);
        }
        return null;
    }

    // ─── Helper: check if fee applicable to student ────────────────────────────
    private boolean isFeeApplicable(Student student, FeeStructure struct) {
        String feeType = struct.getFeeType();
        if ("SCHOOL".equals(feeType) || "EXAM".equals(feeType)) {
            return true;
        }
        String optionalStr = student.getOptionalFeeTypes();
        if (optionalStr == null || optionalStr.isBlank()) return false;
        String[] opted = optionalStr.split(",");
        for (String opt : opted) {
            if (opt.trim().equalsIgnoreCase(feeType)) return true;
        }
        return false;
    }

    // ─── Helper: generate receipt number ───────────────────────────────────────
    private String generateReceiptNumber(Fee fee) {
        // Format: RCP-2025-08-10-0123 (last 4 digits of fee ID)
        String dateStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE); // 2025-08-10
        String idPart = String.format("%04d", fee.getId() % 10000);
        return "RCP-" + dateStr + "-" + idPart;
    }

    // ─── Map to Response ────────────────────────────────────────────────────────
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
                .classroomId(fee.getClassroom() != null ? fee.getClassroom().getId() : null)
                .receiptNumber(fee.getReceiptNumber()) // ensure field exists in FeeResponse
                .build();
    }
}