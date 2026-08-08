package com.orgsphere.school.academic.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.academic.dto.*;
import com.orgsphere.school.academic.service.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/school/academic-years") @RequiredArgsConstructor
public class AcademicYearController {
    private final AcademicYearService service;

    @PostMapping
    public ApiResponse create(@RequestBody AcademicYearRequest req) {
        return ApiResponse.success("Academic year created", service.createAcademicYear(req));
    }

    @PutMapping("/{id}/set-current")
    public ApiResponse setCurrent(@PathVariable Long id, @RequestParam Long orgId) {
        return ApiResponse.success("Academic year set as current", service.setCurrentYear(id, orgId));
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getByOrg(@PathVariable Long orgId) {
        return ApiResponse.success("Academic years fetched", service.getByOrganization(orgId));
    }

    @GetMapping("/organization/{orgId}/current")
    public ApiResponse getCurrent(@PathVariable Long orgId) {
        return ApiResponse.success("Current academic year", service.getCurrentYear(orgId));
    }
}
