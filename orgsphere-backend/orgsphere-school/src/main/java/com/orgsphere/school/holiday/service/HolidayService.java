package com.orgsphere.school.holiday.service;

import com.orgsphere.school.holiday.dto.*;
import java.util.List;

public interface HolidayService {
    HolidayResponse create(HolidayRequest request);
    void delete(Long id);
    List<HolidayResponse> getByOrganization(Long orgId);
}
