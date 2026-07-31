package com.orgsphere.organization.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.organization.dto.OrganizationRequest;
import com.orgsphere.organization.dto.OrganizationResponse;
import com.orgsphere.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    // Get Organization by ID
    @GetMapping("/{id}")
    public ApiResponse getOrganization(@PathVariable Long id) {
        OrganizationResponse response = organizationService.getOrganization(id);
        return ApiResponse.success("Organization fetched successfully", response);
    }

    // Update Organization
    @PutMapping("/{id}")
    public ApiResponse updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationRequest request) {
        OrganizationResponse response = organizationService.updateOrganization(id, request);
        return ApiResponse.success("Organization updated successfully", response);
    }

    // Delete Organization (Soft Delete)
    @DeleteMapping("/{id}")
    public ApiResponse deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
        return ApiResponse.success("Organization deleted successfully");
    }

    // Get All Organizations (Admin only)
    @GetMapping
    public ApiResponse getAllOrganizations() {
        List<OrganizationResponse> organizations = organizationService.getAllOrganizations();
        return ApiResponse.success("Organizations fetched successfully", organizations);
    }
}