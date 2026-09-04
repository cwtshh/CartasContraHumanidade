package com.cwtsh.cartascontrahumanidadeapi.room.dto;

public record CreateRoomRequest(
        String name,
        Integer maxPlayers,
        Integer targetScore,
        String guestDisplayName
) {
}