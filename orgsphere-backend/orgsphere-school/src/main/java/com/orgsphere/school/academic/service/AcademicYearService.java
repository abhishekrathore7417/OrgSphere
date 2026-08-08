package com.orgsphere.school.academic.service;

import com.orgsphere.school.academic.dto.*;

import java.util.List;

public interface AcademicYearService {
    AcademicYearResponse createAcademicYear(AcademicYearRequest request);
    AcademicYearResponse setCurrentYear(Long id, Long orgId);
    List<AcademicYearResponse> getByOrganization(Long orgId);
    AcademicYearResponse getCurrentYear(Long orgId);
}
