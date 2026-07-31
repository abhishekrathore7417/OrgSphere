package com.orgsphere.organization.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.AccountStatus;
import com.orgsphere.common.enums.OrganizationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization extends BaseEntity {

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Enumerated(EnumType.STRING)
    @Column(name = "organization_type", nullable = false)
    private OrganizationType organizationType;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "contact_number", nullable = false)
    private String contactNumber;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;
}