package com.cwtsh.cartascontrahumanidadeapi.room.dto;

public record JoinRoomRequest(
        String code,
        String guestDisplayName
) {
}