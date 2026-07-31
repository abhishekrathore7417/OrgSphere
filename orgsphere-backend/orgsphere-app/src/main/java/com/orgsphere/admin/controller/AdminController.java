package com.orgsphere.admin.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.organization.dto.OrganizationResponse;
import com.orgsphere.organization.service.OrganizationService;
import com.orgsphere.user.dto.UserResponse;
import com.orgsphere.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrganizationService organizationService;
    private final UserService userService;

    // Get all organizations (Super Admin only)
    @GetMapping("/organizations")
    public ApiResponse getAllOrganizations() {
        List<OrganizationResponse> organizations = organizationService.getAllOrganizations();
        return ApiResponse.success("All organizations fetched successfully", organizations);
    }

    // Get all users (Super Admin only)
    @GetMapping("/users")
    public ApiResponse getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ApiResponse.success("All users fetched successfully", users);
    }

    // Admin dashboard stats
    @GetMapping("/dashboard/stats")
    public ApiResponse getDashboardStats() {
        // TODO: Add stats logic
        return ApiResponse.success("Dashboard stats fetched successfully");
    }
}