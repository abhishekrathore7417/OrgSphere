package com.orgsphere.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {

    private Long id;
    private String organizationName;
    private String organizationType;
    private String email;
    private String contactNumber;
    private String address;
    private String status;
}