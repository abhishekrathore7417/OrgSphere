package com.orgsphere.organization.service;

import com.orgsphere.common.enums.AccountStatus;
import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.dto.OrganizationRequest;
import com.orgsphere.organization.dto.OrganizationResponse;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    public OrganizationResponse getOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        return mapToResponse(organization);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(Long id, OrganizationRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        organization.setOrganizationName(request.getOrganizationName());
        organization.setContactNumber(request.getContactNumber());
        organization.setAddress(request.getAddress());

        Organization updated = organizationRepository.save(organization);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        organization.setStatus(AccountStatus.INACTIVE);
        organizationRepository.save(organization);
    }

    @Override
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .filter(org -> org.getStatus() == AccountStatus.ACTIVE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrganizationResponse mapToResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .organizationName(organization.getOrganizationName())
                .organizationType(organization.getOrganizationType().name())
                .email(organization.getEmail())
                .contactNumber(organization.getContactNumber())
                .address(organization.getAddress())
                .status(organization.getStatus().name())
                .build();
    }
}