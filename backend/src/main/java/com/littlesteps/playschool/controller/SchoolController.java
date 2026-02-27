package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.SchoolUpdateDTO;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.SchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/school")
public class SchoolController {

    @Autowired
    private SchoolService schoolService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<School> getSchoolProfile() {
        String schoolId = SchoolContext.getSchoolId();
        System.out.println("SchoolController - getSchoolProfile - SchoolContextID: " + schoolId);

        if (schoolId == null) {
            System.out.println("SchoolController - Returning 404 because schoolId is null");
            return ResponseEntity.notFound().build();
        }
        School school = schoolService.getSchoolProfile(schoolId);
        if (school == null) {
            System.out.println(
                    "SchoolController - Returning 200 (null body) because service returned null for id: " + schoolId);
        }
        return ResponseEntity.ok(school);
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<School> updateSchoolProfile(@RequestBody SchoolUpdateDTO updateDTO,
            Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().build();
        }
        School updatedSchool = schoolService.updateSchoolProfile(schoolId, updateDTO, authentication.getName());
        return ResponseEntity.ok(updatedSchool);
    }
}
