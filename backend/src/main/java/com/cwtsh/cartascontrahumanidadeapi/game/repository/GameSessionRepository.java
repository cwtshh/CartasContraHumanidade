package com.cwtsh.cartascontrahumanidadeapi.game.repository;

import com.cwtsh.cartascontrahumanidadeapi.game.domain.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GameSessionRepository extends JpaRepository<GameSession, UUID> {

    Optional<GameSession> findByRoomId(UUID roomId);

    Optional<GameSession> findByRoomCode(String code);
}