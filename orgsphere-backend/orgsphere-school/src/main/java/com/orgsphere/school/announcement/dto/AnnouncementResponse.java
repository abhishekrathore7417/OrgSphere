package com.orgsphere.school.announcement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String body;
    private String priority;
    private Long organizationId;
    private LocalDateTime createdAt;
}
