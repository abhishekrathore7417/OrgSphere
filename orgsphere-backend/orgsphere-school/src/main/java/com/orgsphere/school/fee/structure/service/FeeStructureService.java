package com.orgsphere.school.fee.structure.service;

import com.orgsphere.school.fee.structure.dto.*;

import java.util.List;

public interface FeeStructureService {
    FeeStructureResponse createFeeStructure(FeeStructureRequest request);
    FeeStructureResponse updateFeeStructure(Long id, FeeStructureRequest request);
    void deleteFeeStructure(Long id);
    List<FeeStructureResponse> getFeeStructuresByOrganization(Long orgId);
}
