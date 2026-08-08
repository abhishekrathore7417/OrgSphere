package com.orgsphere.school.announcement.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementRequest {
    private String title;
    private String body;
    private String priority;
    private Long organizationId;
}
