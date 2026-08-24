package com.cwtsh.cartascontrahumanidadeapi.room.dto;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;

import java.util.List;
import java.util.UUID;

public record RoomResponse(
        UUID id,
        String code,
        String name,
        RoomStatus status,
        Integer maxPlayers,
        List<RoomPlayerResponse> players
) {

    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getCode(),
                room.getName(),
                room.getStatus(),
                room.getMaxPlayers(),
                room.getPlayers().stream()
                        .map(RoomPlayerResponse::from)
                        .toList()
        );
    }
}