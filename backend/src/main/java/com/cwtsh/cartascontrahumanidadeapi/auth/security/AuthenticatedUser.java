package com.cwtsh.cartascontrahumanidadeapi.auth.security;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.UserRole;

import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        String email,
        String displayName,
        UserRole role
) {
    public static AuthenticatedUser from(User user) {
        return new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole()
        );
    }
}