package com.orgsphere.school.fee.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.fee.dto.FeeRequest;
import com.orgsphere.school.fee.dto.FeeResponse;
import com.orgsphere.school.fee.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/school/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @PostMapping
    public ApiResponse createFee(@Valid @RequestBody FeeRequest request) {
        FeeResponse response = feeService.createFee(request);
        return ApiResponse.success("Fee created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getFee(@PathVariable Long id) {
        FeeResponse response = feeService.getFee(id);
        return ApiResponse.success("Fee fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateFee(@PathVariable Long id, @Valid @RequestBody FeeRequest request) {
        FeeResponse response = feeService.updateFee(id, request);
        return ApiResponse.success("Fee updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ApiResponse.success("Fee deleted successfully");
    }

    @PutMapping("/{id}/pay")
    public ApiResponse payFee(@PathVariable Long id, @RequestParam Double amount) {
        FeeResponse response = feeService.payFee(id, amount);
        return ApiResponse.success("Fee paid successfully", response);
    }

    @PutMapping("/{id}/waive")
    public ApiResponse waiveFee(@PathVariable Long id) {
        FeeResponse response = feeService.waiveFee(id);
        return ApiResponse.success("Fee waived successfully", response);
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse getFeesByStudent(@PathVariable Long studentId) {
        List<FeeResponse> fees = feeService.getFeesByStudent(studentId);
        return ApiResponse.success("Fees fetched successfully", fees);
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getFeesByOrganization(@PathVariable Long orgId) {
        List<FeeResponse> fees = feeService.getFeesByOrganization(orgId);
        return ApiResponse.success("Fees fetched successfully", fees);
    }

    @GetMapping("/organization/{orgId}/pending")
    public ApiResponse getPendingFees(@PathVariable Long orgId) {
        List<FeeResponse> fees = feeService.getPendingFees(orgId);
        return ApiResponse.success("Pending fees fetched successfully", fees);
    }

    @GetMapping("/organization/{orgId}/overdue")
    public ApiResponse getOverdueFees(@PathVariable Long orgId) {
        List<FeeResponse> fees = feeService.getOverdueFees(orgId);
        return ApiResponse.success("Overdue fees fetched successfully", fees);
    }

    @GetMapping("/organization/{orgId}/range")
    public ApiResponse getFeesByDateRange(
            @PathVariable Long orgId,
            @RequestParam String start,
            @RequestParam String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        List<FeeResponse> fees = feeService.getFeesByDateRange(orgId, startDate, endDate);
        return ApiResponse.success("Fees fetched successfully", fees);
    }
}