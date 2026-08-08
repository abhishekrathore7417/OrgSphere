package com.orgsphere.school.academic.service;

import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.academic.dto.*;
import com.orgsphere.school.academic.entity.AcademicYear;
import com.orgsphere.school.academic.repository.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class AcademicYearServiceImpl implements AcademicYearService {
    private final AcademicYearRepository repo;
    private final OrganizationRepository orgRepo;

    @Override
    public AcademicYearResponse createAcademicYear(AcademicYearRequest req) {
        Organization org = orgRepo.findById(req.getOrganizationId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        
        if (Boolean.TRUE.equals(req.getIsCurrent())) {
            repo.findByOrganizationAndIsCurrent(org, true).ifPresent(y -> { y.setIsCurrent(false); repo.save(y); });
        }
        
        AcademicYear ay = AcademicYear.builder()
                .name(req.getName())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrent(Boolean.TRUE.equals(req.getIsCurrent()))
                .organization(org)
                .build();
                
        return map(repo.save(ay));
    }

    @Override
    public AcademicYearResponse setCurrentYear(Long id, Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        repo.findByOrganizationAndIsCurrent(org, true).ifPresent(y -> { y.setIsCurrent(false); repo.save(y); });
        
        AcademicYear ay = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));
        ay.setIsCurrent(true);
        
        return map(repo.save(ay));
    }

    @Override
    public List<AcademicYearResponse> getByOrganization(Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        return repo.findByOrganization(org).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public AcademicYearResponse getCurrentYear(Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        return repo.findByOrganizationAndIsCurrent(org, true).map(this::map).orElse(null);
    }

    private AcademicYearResponse map(AcademicYear ay) {
        return AcademicYearResponse.builder()
                .id(ay.getId())
                .name(ay.getName())
                .startDate(ay.getStartDate())
                .endDate(ay.getEndDate())
                .isCurrent(ay.getIsCurrent())
                .organizationId(ay.getOrganization().getId())
                .build();
    }
}
