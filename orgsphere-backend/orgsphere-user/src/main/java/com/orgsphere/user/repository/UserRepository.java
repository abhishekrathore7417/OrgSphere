package com.orgsphere.user.repository;

import com.orgsphere.common.enums.RoleType;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query(value = "SELECT * FROM users u WHERE u.email = :loginId OR u.contact_number = :loginId LIMIT 1", nativeQuery = true)
    Optional<User> findByEmailOrMobile(@Param("loginId") String loginId);

    boolean existsByEmail(String email);

    List<User> findByOrganization(Organization organization);
    List<User> findByOrganizationAndRole(Organization organization, RoleType role);
}