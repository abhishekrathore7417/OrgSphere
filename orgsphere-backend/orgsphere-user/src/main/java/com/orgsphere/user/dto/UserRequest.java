package com.orgsphere.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Password optional — if not provided, a default is set by the service
    private String password;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    private String role;  // ORG_ADMIN, EMPLOYEE, STUDENT, TEACHER
    private Long organizationId;
}