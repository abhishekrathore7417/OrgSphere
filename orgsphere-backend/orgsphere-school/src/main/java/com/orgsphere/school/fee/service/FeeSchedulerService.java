package com.orgsphere.school.fee.service;

import com.orgsphere.common.enums.FeeStatus;
import com.orgsphere.common.enums.StudentStatus;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.classroom.entity.Classroom;
import com.orgsphere.school.fee.entity.Fee;
import com.orgsphere.school.fee.repository.FeeRepository;
import com.orgsphere.school.fee.structure.entity.FeeStructure;
import com.orgsphere.school.fee.structure.repository.FeeStructureRepository;
import com.orgsphere.school.student.entity.Student;
import com.orgsphere.school.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FeeSchedulerService {

    private final FeeStructureRepository feeStructureRepo;
    private final StudentRepository studentRepo;
    private final FeeRepository feeRepo;
    private final OrganizationRepository organizationRepo;

    /**
     * Daily at midnight – generate fees for the next period
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void generateRecurringFees() {
        log.info("=== Starting scheduled fee generation ===");

        List<FeeStructure> structures = feeStructureRepo.findAll();
        if (structures.isEmpty()) {
            log.warn("No fee structures found. Skipping generation.");
            return;
        }

        List<Organization> organizations = organizationRepo.findAll();
        for (Organization org : organizations) {
            generateFeesForOrganization(org, structures);
        }

        log.info("=== Fee generation completed ===");
    }

    private void generateFeesForOrganization(Organization org, List<FeeStructure> structures) {
        List<Student> students = studentRepo.findByOrganizationAndStatus(org, StudentStatus.ACTIVE);
        if (students.isEmpty()) {
            log.debug("No active students for org: {}", org.getOrganizationName());
            return;
        }

        LocalDate today = LocalDate.now();
        int created = 0, skipped = 0;

        // ✅ Get organization's late fee percentage (default 5%)
        double lateFeePercent = org.getLateFeePercent() != null ? org.getLateFeePercent() : 5.0;

        for (FeeStructure struct : structures) {
            if (!struct.getIsActive()) continue;

            LocalDate dueDate = computeNextDueDate(struct, today);
            if (dueDate == null) continue;

            for (Student student : students) {
                if (!isFeeApplicable(student, struct)) {
                    skipped++;
                    continue;
                }

                boolean exists = feeRepo.existsByStudentAndFeeTypeAndDueDate(
                        student.getUser(), struct.getFeeType(), dueDate
                );
                if (exists) {
                    skipped++;
                    continue;
                }

                // Get classroom from student
                Classroom classroom = student.getClassroom();

                // ✅ Calculate penalty based on organization's late fee percentage
                double penalty = 0.0;
                if (dueDate.isBefore(today)) {
                    penalty = struct.getAmount() * (lateFeePercent / 100);
                }

                Fee fee = Fee.builder()
                        .feeType(struct.getFeeType())
                        .amount(struct.getAmount())
                        .dueDate(dueDate)
                        .description(struct.getDescription() != null ? struct.getDescription() : "Auto-generated " + struct.getFeeType())
                        .status(dueDate.isBefore(today) ? FeeStatus.OVERDUE : FeeStatus.PENDING)
                        .paidAmount(0.0)
                        .remainingAmount(struct.getAmount() + penalty)
                        .penalty(penalty)
                        .student(student.getUser())
                        .classroom(classroom)
                        .organization(org)
                        .build();

                feeRepo.save(fee);
                created++;
            }
        }

        log.info("Org: {} – created: {}, skipped: {}, late fee: {}%",
                org.getOrganizationName(), created, skipped, lateFeePercent);
    }

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
            if (refDate.getDayOfMonth() > day) {
                dueQuarter++;
            }
            if (dueQuarter > 3) {
                dueQuarter = 0;
                year++;
            }
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

    private boolean isFeeApplicable(Student student, FeeStructure struct) {
        String feeType = struct.getFeeType();
        if ("SCHOOL".equals(feeType) || "EXAM".equals(feeType)) {
            return true;
        }
        String optionalStr = student.getOptionalFeeTypes();
        if (optionalStr == null || optionalStr.isBlank()) {
            return false;
        }
        String[] opted = optionalStr.split(",");
        for (String opt : opted) {
            if (opt.trim().equalsIgnoreCase(feeType)) {
                return true;
            }
        }
        return false;
    }

    // ========== Overdue job (daily at 1 AM) ==========

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void processOverdueFees() {
        log.info("=== Processing overdue fees ===");
        LocalDate today = LocalDate.now();

        // Fetch all overdue fees (excluding PAID and WAIVED)
        List<Fee> fees = feeRepo.findOverdueFees(today, FeeStatus.PAID, FeeStatus.WAIVED);
        int updated = 0;

        for (Fee fee : fees) {
            if (fee.getStatus() == FeeStatus.OVERDUE) {
                // Already processed – skip
                continue;
            }

            // ✅ Get organization's late fee percentage (default 5%)
            Organization org = fee.getOrganization();
            double lateFeePercent = org.getLateFeePercent() != null ? org.getLateFeePercent() : 5.0;

            // Mark as OVERDUE
            fee.setStatus(FeeStatus.OVERDUE);

            // ✅ Add penalty using organization's percentage (if not already added)
            if (fee.getPenalty() == null || fee.getPenalty() == 0.0) {
                double penalty = fee.getAmount() * (lateFeePercent / 100);
                fee.setPenalty(penalty);
                fee.setRemainingAmount(fee.getRemainingAmount() + penalty);
            }

            feeRepo.save(fee);
            updated++;
        }

        log.info("Updated {} fees to OVERDUE and added penalty", updated);
    }
}