package com.orgsphere.school.announcement.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.announcement.dto.*;
import com.orgsphere.school.announcement.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/school/announcements") @RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementService service;

    @PostMapping
    public ApiResponse create(@RequestBody AnnouncementRequest req) {
        return ApiResponse.success("Announcement created", service.create(req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Announcement deleted");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getByOrg(@PathVariable Long orgId) {
        return ApiResponse.success("Announcements fetched", service.getByOrganization(orgId));
    }
}
