package com.orgsphere.school.announcement.repository;

import com.orgsphere.organization.entity.Organization;
import com.orgsphere.school.announcement.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByOrganizationOrderByCreatedAtDesc(Organization organization);
}
