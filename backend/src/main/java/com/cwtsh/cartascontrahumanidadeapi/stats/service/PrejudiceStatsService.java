package com.cwtsh.cartascontrahumanidadeapi.stats.service;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.PrejudiceCategory;
import com.cwtsh.cartascontrahumanidadeapi.card.domain.WhiteCard;
import com.cwtsh.cartascontrahumanidadeapi.stats.domain.UserPrejudiceStat;
import com.cwtsh.cartascontrahumanidadeapi.stats.dto.PrejudiceStatsResponse;
import com.cwtsh.cartascontrahumanidadeapi.stats.repository.UserPrejudiceStatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PrejudiceStatsService {

    private final UserPrejudiceStatRepository userPrejudiceStatRepository;

    public PrejudiceStatsService(UserPrejudiceStatRepository userPrejudiceStatRepository) {
        this.userPrejudiceStatRepository = userPrejudiceStatRepository;
    }

    @Transactional
    public void recordSubmission(UUID userId, List<WhiteCard> submittedCards) {
        for (WhiteCard card : submittedCards) {
            for (PrejudiceCategory category : card.getCategories()) {
                UserPrejudiceStat stat = userPrejudiceStatRepository
                        .findByUserIdAndCategory(userId, category)
                        .orElseGet(() -> UserPrejudiceStat.builder()
                                .userId(userId)
                                .category(category)
                                .count(0L)
                                .build());

                stat.setCount(stat.getCount() + 1);
                userPrejudiceStatRepository.save(stat);
            }
        }
    }

    @Transactional
    public PrejudiceStatsResponse getStatsForUser(UUID userId) {
        List<UserPrejudiceStat> stats = userPrejudiceStatRepository.findByUserId(userId);

        Map<PrejudiceCategory, Long> counts = new EnumMap<>(PrejudiceCategory.class);
        for (PrejudiceCategory category : PrejudiceCategory.values()) {
            counts.put(category, 0L);
        }
        for (UserPrejudiceStat stat : stats) {
            counts.put(stat.getCategory(), stat.getCount());
        }

        long maxCount = counts.values().stream().mapToLong(Long::longValue).max().orElse(0L);
        int totalTagged = counts.values().stream().mapToInt(Long::intValue).sum();

        List<PrejudiceStatsResponse.CategoryScore> categories = counts.entrySet().stream()
                .map(entry -> new PrejudiceStatsResponse.CategoryScore(
                        entry.getKey(),
                        entry.getValue(),
                        maxCount == 0 ? 0 : (int) Math.round(entry.getValue() * 100.0 / maxCount)
                ))
                .toList();

        return new PrejudiceStatsResponse(categories, totalTagged);
    }
}
