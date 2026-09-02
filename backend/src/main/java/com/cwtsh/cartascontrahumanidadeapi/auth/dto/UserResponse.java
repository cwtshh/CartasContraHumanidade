package com.cwtsh.cartascontrahumanidadeapi.auth.dto;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String displayName, String email, boolean emailVerified, String image, UserRole role, Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getImage(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
