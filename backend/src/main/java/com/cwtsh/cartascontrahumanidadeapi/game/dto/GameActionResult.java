package com.cwtsh.cartascontrahumanidadeapi.game.dto;

import java.util.Map;
import java.util.UUID;

public record GameActionResult(
        GamePublicStateResponse publicState,
        Map<UUID, GamePrivateStateResponse> privateStates
) {}
