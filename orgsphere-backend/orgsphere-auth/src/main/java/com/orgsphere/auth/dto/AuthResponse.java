package com.orgsphere.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String message;
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String organizationType;
    private String organizationName;
    private Long organizationId;
}