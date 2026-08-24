package com.cwtsh.cartascontrahumanidadeapi.room.dto;

public record CreateRoomRequest(
        String name,
        Integer maxPlayers,
        String guestDisplayName
) {
}