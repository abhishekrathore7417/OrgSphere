package com.orgsphere.payment.repository;

import com.orgsphere.organization.entity.Organization;
import com.orgsphere.payment.entity.Payment;
import com.orgsphere.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrganization(Organization organization);

    List<Payment> findByUser(User user);
}