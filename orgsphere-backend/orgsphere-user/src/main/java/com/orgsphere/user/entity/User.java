package com.orgsphere.user.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.common.enums.AccountStatus;
import com.orgsphere.common.enums.RoleType;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "contact_number", nullable = false)  // ✅ Column name match
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Getters
    public Long getId() { return super.getId(); }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getContactNumber() { return contactNumber; }
    public RoleType getRole() { return role; }
    public AccountStatus getStatus() { return status; }
    public Organization getOrganization() { return organization; }

    // Setters
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public void setRole(RoleType role) { this.role = role; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public void setOrganization(Organization organization) { this.organization = organization; }
}