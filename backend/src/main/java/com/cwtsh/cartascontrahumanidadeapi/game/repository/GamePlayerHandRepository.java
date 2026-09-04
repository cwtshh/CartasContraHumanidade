package com.cwtsh.cartascontrahumanidadeapi.game.repository;

import com.cwtsh.cartascontrahumanidadeapi.game.domain.GamePlayerHand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GamePlayerHandRepository extends JpaRepository<GamePlayerHand, UUID> {

    List<GamePlayerHand> findByGameSessionId(UUID gameSessionId);

    Optional<GamePlayerHand> findByGameSessionIdAndRoomPlayerId(
            UUID gameSessionId,
            UUID roomPlayerId
    );

    @Modifying(flushAutomatically = true)
    @Query("delete from GamePlayerHand h where h.roomPlayer.id = :roomPlayerId")
    long deleteByRoomPlayerId(@Param("roomPlayerId") UUID roomPlayerId);
}