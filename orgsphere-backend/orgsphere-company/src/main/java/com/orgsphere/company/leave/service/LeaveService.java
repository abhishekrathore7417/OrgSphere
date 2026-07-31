package com.orgsphere.company.leave.service;

import com.orgsphere.company.leave.dto.LeaveRequest;
import com.orgsphere.company.leave.dto.LeaveResponse;

import java.util.List;

public interface LeaveService {

    LeaveResponse applyLeave(LeaveRequest request);

    LeaveResponse getLeave(Long id);

    LeaveResponse updateLeave(Long id, LeaveRequest request);

    void cancelLeave(Long id);

    LeaveResponse approveLeave(Long id);

    LeaveResponse rejectLeave(Long id);

    List<LeaveResponse> getLeavesByUser(Long userId);

    List<LeaveResponse> getLeavesByOrganization(Long organizationId);

    List<LeaveResponse> getPendingLeaves(Long organizationId);
}