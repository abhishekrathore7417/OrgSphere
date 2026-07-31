package com.orgsphere.security.jwt;

public class JwtConstants {

    private JwtConstants() {
    }

    public static final String SECRET_KEY =
            "OrgSphere@2026SuperSecureJwtSecretKeyForCompanySchoolManagementApplication";

    public static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24; // 24 Hours

    public static final String TOKEN_PREFIX = "Bearer ";

    public static final String HEADER = "Authorization";
}