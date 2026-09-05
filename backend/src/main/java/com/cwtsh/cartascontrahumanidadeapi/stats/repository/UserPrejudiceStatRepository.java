package com.cwtsh.cartascontrahumanidadeapi.stats.repository;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.PrejudiceCategory;
import com.cwtsh.cartascontrahumanidadeapi.stats.domain.UserPrejudiceStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserPrejudiceStatRepository extends JpaRepository<UserPrejudiceStat, UUID> {

    List<UserPrejudiceStat> findByUserId(UUID userId);

    Optional<UserPrejudiceStat> findByUserIdAndCategory(UUID userId, PrejudiceCategory category);
}
