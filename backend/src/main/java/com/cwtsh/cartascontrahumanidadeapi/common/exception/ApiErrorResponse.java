package com.cwtsh.cartascontrahumanidadeapi.common.exception;

import java.time.Instant;

public record ApiErrorResponse(
        int status,
        String code,
        String message,
        Instant timestamp,
        String path
) {
}
