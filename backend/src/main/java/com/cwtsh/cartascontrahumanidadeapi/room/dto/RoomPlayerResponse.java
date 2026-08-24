package com.cwtsh.cartascontrahumanidadeapi.room.dto;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayerRole;

import java.util.UUID;

public record RoomPlayerResponse(
        UUID id,
        String displayName,
        RoomPlayerRole role,
        Boolean connected,
        Boolean guest
) {

    public static RoomPlayerResponse from(RoomPlayer player) {
        return new RoomPlayerResponse(
                player.getId(),
                player.getDisplayName(),
                player.getRole(),
                player.getConnected(),
                player.isGuest()
        );
    }
}