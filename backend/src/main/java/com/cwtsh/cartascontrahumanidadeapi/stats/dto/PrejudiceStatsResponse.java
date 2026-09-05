package com.cwtsh.cartascontrahumanidadeapi.stats.dto;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.PrejudiceCategory;

import java.util.List;

public record PrejudiceStatsResponse(
        List<CategoryScore> categories,
        int totalTaggedCardsSubmitted
) {
    public record CategoryScore(
            PrejudiceCategory category,
            long count,
            int percentage
    ) {}
}
