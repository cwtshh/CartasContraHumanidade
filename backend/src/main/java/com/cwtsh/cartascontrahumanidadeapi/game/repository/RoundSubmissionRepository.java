package com.cwtsh.cartascontrahumanidadeapi.game.repository;

import com.cwtsh.cartascontrahumanidadeapi.game.domain.RoundSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoundSubmissionRepository extends JpaRepository<RoundSubmission, UUID> {

    List<RoundSubmission> findByGameSessionId(UUID gameSessionId);

    Optional<RoundSubmission> findByGameSessionIdAndRoomPlayerId(
            UUID gameSessionId,
            UUID roomPlayerId
    );

    long countByGameSessionId(UUID gameSessionId);
}