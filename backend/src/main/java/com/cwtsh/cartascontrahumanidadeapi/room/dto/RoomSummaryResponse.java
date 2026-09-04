package com.cwtsh.cartascontrahumanidadeapi.room.dto;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;

import java.time.Instant;
import java.util.UUID;

public record RoomSummaryResponse(
        UUID id,
        String code,
        String name,
        RoomStatus status,
        Integer maxPlayers,
        int currentPlayers,
        Instant createdAt
) {

    public static RoomSummaryResponse from(Room room) {
        return new RoomSummaryResponse(
                room.getId(),
                room.getCode(),
                room.getName(),
                room.getStatus(),
                room.getMaxPlayers(),
                room.getPlayers().size(),
                room.getCreatedAt()
        );
    }
}