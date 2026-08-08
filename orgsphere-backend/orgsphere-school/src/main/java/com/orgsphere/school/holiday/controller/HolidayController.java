package com.orgsphere.school.holiday.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.holiday.dto.*;
import com.orgsphere.school.holiday.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/school/holidays") @RequiredArgsConstructor
public class HolidayController {
    private final HolidayService service;

    @PostMapping
    public ApiResponse create(@RequestBody HolidayRequest req) {
        return ApiResponse.success("Holiday created", service.create(req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Holiday deleted");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getByOrg(@PathVariable Long orgId) {
        return ApiResponse.success("Holidays fetched", service.getByOrganization(orgId));
    }
}
