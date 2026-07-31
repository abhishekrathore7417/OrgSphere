package com.orgsphere.user.service;

import com.orgsphere.user.dto.UserRequest;
import com.orgsphere.user.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUser(Long id);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);

    List<UserResponse> getUsersByOrganization(Long organizationId);

    List<UserResponse> getAllUsers();

    List<UserResponse> getUsersByOrganizationAndRole(Long organizationId, String role);
}