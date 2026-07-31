package com.orgsphere.organization.service;

import com.orgsphere.organization.dto.OrganizationRequest;
import com.orgsphere.organization.dto.OrganizationResponse;

import java.util.List;

public interface OrganizationService {

    OrganizationResponse getOrganization(Long id);

    OrganizationResponse updateOrganization(Long id, OrganizationRequest request);

    void deleteOrganization(Long id);

    List<OrganizationResponse> getAllOrganizations();
}