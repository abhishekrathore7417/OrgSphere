package com.orgsphere.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email or Mobile is required")
    // ✅ @Email hatao - email OR mobile dono accept karega
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}