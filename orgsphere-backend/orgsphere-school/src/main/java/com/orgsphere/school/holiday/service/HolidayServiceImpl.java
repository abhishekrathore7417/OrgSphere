package com.orgsphere.school.holiday.service;

import com.orgsphere.common.exception.ResourceNotFoundException;
import com.orgsphere.organization.entity.Organization;
import com.orgsphere.organization.repository.OrganizationRepository;
import com.orgsphere.school.holiday.dto.*;
import com.orgsphere.school.holiday.entity.Holiday;
import com.orgsphere.school.holiday.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class HolidayServiceImpl implements HolidayService {
    private final HolidayRepository repo;
    private final OrganizationRepository orgRepo;

    @Override
    public HolidayResponse create(HolidayRequest req) {
        Organization org = orgRepo.findById(req.getOrganizationId()).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        Holiday h = Holiday.builder().date(req.getDate()).name(req.getName()).organization(org).build();
        return map(repo.save(h));
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public List<HolidayResponse> getByOrganization(Long orgId) {
        Organization org = orgRepo.findById(orgId).orElseThrow(() -> new ResourceNotFoundException("Org not found"));
        return repo.findByOrganizationOrderByDateAsc(org).stream().map(this::map).collect(Collectors.toList());
    }

    private HolidayResponse map(Holiday h) {
        return HolidayResponse.builder().id(h.getId()).date(h.getDate()).name(h.getName()).organizationId(h.getOrganization().getId()).build();
    }
}
