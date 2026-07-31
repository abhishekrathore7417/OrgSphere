package com.orgsphere.user.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.user.dto.UserRequest;
import com.orgsphere.user.dto.UserResponse;
import com.orgsphere.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ApiResponse createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request);
        return ApiResponse.success("User created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse getUser(@PathVariable Long id) {
        UserResponse response = userService.getUser(id);
        return ApiResponse.success("User fetched successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ApiResponse.success("User updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getUsersByOrganization(@PathVariable Long orgId) {
        List<UserResponse> users = userService.getUsersByOrganization(orgId);
        return ApiResponse.success("Users fetched successfully", users);
    }

    @GetMapping
    public ApiResponse getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ApiResponse.success("All users fetched successfully", users);
    }
    @GetMapping("/organization/{orgId}/role/{role}")
    public ApiResponse getUsersByOrganizationAndRole(
            @PathVariable Long orgId,
            @PathVariable String role) {
        List<UserResponse> users = userService.getUsersByOrganizationAndRole(orgId, role);
        return ApiResponse.success("Users fetched successfully", users);
    }
}