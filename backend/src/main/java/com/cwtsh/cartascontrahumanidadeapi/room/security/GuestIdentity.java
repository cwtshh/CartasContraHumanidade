package com.cwtsh.cartascontrahumanidadeapi.room.security;

public record GuestIdentity(
        String guestId,
        String displayName
) {
}