package com.cwtsh.cartascontrahumanidadeapi.game.dto;

import java.util.List;
import java.util.UUID;

public record GamePrivateStateResponse(
        UUID gameSessionId,
        List<UUID> myHand,
        boolean hasSubmitted
) {

    public static GamePrivateStateResponse from(
            List<UUID> myHand,
            UUID gameSessionId,
            boolean hasSubmitted
    ) {
        return new GamePrivateStateResponse(gameSessionId, myHand, hasSubmitted);
    }
}
