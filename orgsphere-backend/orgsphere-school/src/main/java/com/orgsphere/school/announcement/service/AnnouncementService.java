package com.orgsphere.school.announcement.service;

import com.orgsphere.school.announcement.dto.*;
import java.util.List;

public interface AnnouncementService {
    AnnouncementResponse create(AnnouncementRequest request);
    void delete(Long id);
    List<AnnouncementResponse> getByOrganization(Long orgId);
}
