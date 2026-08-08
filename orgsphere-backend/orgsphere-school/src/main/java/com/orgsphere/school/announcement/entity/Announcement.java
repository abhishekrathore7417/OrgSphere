package com.orgsphere.school.announcement.entity;

import com.orgsphere.common.entity.BaseEntity;
import com.orgsphere.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Announcement extends BaseEntity {
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private String priority; // HIGH, NORMAL

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
}
