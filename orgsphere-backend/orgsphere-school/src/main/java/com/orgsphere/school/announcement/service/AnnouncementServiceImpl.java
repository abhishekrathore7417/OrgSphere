package com.orgsphere.school.announcement.service;

import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.announcement.dto.*;
import com.orgsphere.school.announcement.entity.Announcement;
import com.orgsphere.school.announcement.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class AnnouncementServiceImpl implements AnnouncementService {
    private final AnnouncementRepository repo;
    private final OrganizationRepository orgRepo;

    @Override
    public AnnouncementResponse create(AnnouncementRequest req) {
        Organization org = orgRepo.findById(req.getOrganizationId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Announcement a = Announcement.builder()
                .title(req.getTitle())
                .body(req.getBody())
                .priority(req.getPriority() != null ? req.getPriority() : "NORMAL")
                .organization(org)
                .build();
        return map(repo.save(a));
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public List<AnnouncementResponse> getByOrganization(Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        return repo.findByOrganizationOrderByCreatedAtDesc(org).stream().map(this::map).collect(Collectors.toList());
    }

    private AnnouncementResponse map(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .body(a.getBody())
                .priority(a.getPriority())
                .organizationId(a.getOrganization().getId())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
