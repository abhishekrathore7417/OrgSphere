package com.orgsphere.school.fee.structure.service;

import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.fee.structure.dto.*;
import com.orgsphere.school.fee.structure.entity.FeeStructure;
import com.orgsphere.school.fee.structure.repository.FeeStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class FeeStructureServiceImpl implements FeeStructureService {
    private final FeeStructureRepository repo;
    private final OrganizationRepository orgRepo;

    @Override
    public FeeStructureResponse createFeeStructure(FeeStructureRequest req) {
        Organization org = orgRepo.findById(req.getOrganizationId()).orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        FeeStructure fs = FeeStructure.builder().feeType(req.getFeeType()).amount(req.getAmount()).frequency(req.getFrequency()).dueDay(req.getDueDay()).description(req.getDescription()).isActive(true).organization(org).build();
        return map(repo.save(fs));
    }

    @Override
    public FeeStructureResponse updateFeeStructure(Long id, FeeStructureRequest req) {
        FeeStructure fs = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Fee structure not found"));
        fs.setFeeType(req.getFeeType()); fs.setAmount(req.getAmount()); fs.setFrequency(req.getFrequency()); fs.setDueDay(req.getDueDay()); fs.setDescription(req.getDescription());
        return map(repo.save(fs));
    }

    @Override
    public void deleteFeeStructure(Long id) {
        FeeStructure fs = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Fee structure not found"));
        fs.setIsActive(false); repo.save(fs);
    }

    @Override
    public List<FeeStructureResponse> getFeeStructuresByOrganization(Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return repo.findByOrganizationAndIsActive(org, true).stream().map(this::map).collect(Collectors.toList());
    }

    private FeeStructureResponse map(FeeStructure fs) {
        return FeeStructureResponse.builder().id(fs.getId()).feeType(fs.getFeeType()).amount(fs.getAmount()).frequency(fs.getFrequency()).dueDay(fs.getDueDay()).description(fs.getDescription()).isActive(fs.getIsActive()).organizationId(fs.getOrganization().getId()).organizationName(fs.getOrganization().getOrganizationName()).build();
    }
}
