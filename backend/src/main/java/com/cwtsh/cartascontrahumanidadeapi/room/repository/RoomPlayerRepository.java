package com.cwtsh.cartascontrahumanidadeapi.room.repository;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomPlayerRepository
        extends JpaRepository<RoomPlayer, UUID> {

    List<RoomPlayer> findByRoomId(UUID roomId);

    Optional<RoomPlayer> findByRoomIdAndUserId(UUID roomId, UUID userId);

    Optional<RoomPlayer> findByRoomIdAndGuestId(UUID roomId, String guestId);

    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);

    boolean existsByRoomIdAndGuestId(UUID roomId, String guestId);

    long countByRoomId(UUID roomId);
}