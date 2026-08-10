package com.orgsphere.school.fee.service;

import com.orgsphere.school.fee.dto.FeeRequest;
import com.orgsphere.school.fee.dto.FeeResponse;

import java.time.LocalDate;
import java.util.List;

public interface FeeService {

    FeeResponse createFee(FeeRequest request);

    FeeResponse getFee(Long id);

    FeeResponse updateFee(Long id, FeeRequest request);

    void deleteFee(Long id);

    FeeResponse payFee(Long id, Double amount);

    FeeResponse waiveFee(Long id);

    List<FeeResponse> getFeesByStudent(Long studentId);

    List<FeeResponse> getFeesByOrganization(Long organizationId);

    List<FeeResponse> getPendingFees(Long organizationId);

    List<FeeResponse> getOverdueFees(Long organizationId);

    List<FeeResponse> getFeesByDateRange(Long organizationId, LocalDate start, LocalDate end);

    List<FeeResponse> generateFeesForClassroom(Long classroomId);

}