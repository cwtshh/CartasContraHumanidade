package com.cwtsh.cartascontrahumanidadeapi.auth.service;

import com.cwtsh.cartascontrahumanidadeapi.auth.dto.UserResponse;

public record AuthenticationResult(UserResponse user, String sessionToken) {
}
