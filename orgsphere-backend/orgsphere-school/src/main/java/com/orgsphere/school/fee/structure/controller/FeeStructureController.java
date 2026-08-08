package com.orgsphere.school.fee.structure.controller;

import com.orgsphere.common.dto.ApiResponse;
import com.orgsphere.school.fee.structure.dto.*;
import com.orgsphere.school.fee.structure.service.FeeStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/school/fee-structures") @RequiredArgsConstructor
public class FeeStructureController {
    private final FeeStructureService service;

    @PostMapping
    public ApiResponse create(@RequestBody FeeStructureRequest req) {
        return ApiResponse.success("Fee structure created", service.createFeeStructure(req));
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable Long id, @RequestBody FeeStructureRequest req) {
        return ApiResponse.success("Fee structure updated", service.updateFeeStructure(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.deleteFeeStructure(id);
        return ApiResponse.success("Fee structure deleted");
    }

    @GetMapping("/organization/{orgId}")
    public ApiResponse getByOrg(@PathVariable Long orgId) {
        List<FeeStructureResponse> list = service.getFeeStructuresByOrganization(orgId);
        return ApiResponse.success("Fee structures fetched", list);
    }
}
