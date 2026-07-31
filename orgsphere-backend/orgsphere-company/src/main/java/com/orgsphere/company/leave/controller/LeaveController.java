package com.orgsphere.company.leave.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.company.leave.dto.LeaveRequest;
import com.orgsphere.company.leave.dto.LeaveResponse;
import com.orgsphere.company.leave.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // Apply Leave
    @PostMapping
    public ApiResponse applyLeave(@Valid @RequestBody LeaveRequest request) {
        LeaveResponse response = leaveService.applyLeave(request);
        return ApiResponse.success("Leave applied successfully", response);
    }

    // Get Leave by ID
    @GetMapping("/{id}")
    public ApiResponse getLeave(@PathVariable Long id) {
        LeaveResponse response = leaveService.getLeave(id);
        return ApiResponse.success("Leave fetched successfully", response);
    }

    // Update Leave
    @PutMapping("/{id}")
    public ApiResponse updateLeave(@PathVariable Long id, @Valid @RequestBody LeaveRequest request) {
        LeaveResponse response = leaveService.updateLeave(id, request);
        return ApiResponse.success("Leave updated successfully", response);
    }

    // Cancel Leave
    @DeleteMapping("/{id}")
    public ApiResponse cancelLeave(@PathVariable Long id) {
        leaveService.cancelLeave(id);
        return ApiResponse.success("Leave cancelled successfully");
    }

    // Approve Leave
    @PutMapping("/{id}/approve")
    public ApiResponse approveLeave(@PathVariable Long id) {
        LeaveResponse response = leaveService.approveLeave(id);
        return ApiResponse.success("Leave approved successfully", response);
    }

    // Reject Leave
    @PutMapping("/{id}/reject")
    public ApiResponse rejectLeave(@PathVariable Long id) {
        LeaveResponse response = leaveService.rejectLeave(id);
        return ApiResponse.success("Leave rejected successfully", response);
    }

    // Get Leaves by User
    @GetMapping("/user/{userId}")
    public ApiResponse getLeavesByUser(@PathVariable Long userId) {
        List<LeaveResponse> leaves = leaveService.getLeavesByUser(userId);
        return ApiResponse.success("Leaves fetched successfully", leaves);
    }

    // Get Leaves by Organization
    @GetMapping("/organization/{orgId}")
    public ApiResponse getLeavesByOrganization(@PathVariable Long orgId) {
        List<LeaveResponse> leaves = leaveService.getLeavesByOrganization(orgId);
        return ApiResponse.success("Leaves fetched successfully", leaves);
    }

    // Get Pending Leaves
    @GetMapping("/organization/{orgId}/pending")
    public ApiResponse getPendingLeaves(@PathVariable Long orgId) {
        List<LeaveResponse> leaves = leaveService.getPendingLeaves(orgId);
        return ApiResponse.success("Pending leaves fetched successfully", leaves);
    }
}