package com.cwtsh.cartascontrahumanidadeapi.stats.controller;

import com.cwtsh.cartascontrahumanidadeapi.auth.security.AuthenticatedUser;
import com.cwtsh.cartascontrahumanidadeapi.stats.dto.PrejudiceStatsResponse;
import com.cwtsh.cartascontrahumanidadeapi.stats.service.PrejudiceStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final PrejudiceStatsService prejudiceStatsService;

    public ProfileController(PrejudiceStatsService prejudiceStatsService) {
        this.prejudiceStatsService = prejudiceStatsService;
    }

    @GetMapping("/prejudice-stats")
    public ResponseEntity<PrejudiceStatsResponse> getPrejudiceStats(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(prejudiceStatsService.getStatsForUser(user.id()));
    }
}
