package com.cwtsh.cartascontrahumanidadeapi.card.dto;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.WhiteCard;

import java.util.UUID;

public record WhiteCardResponse(UUID id, String text) {
    public static WhiteCardResponse from(WhiteCard whiteCard) {
        return new WhiteCardResponse(
                whiteCard.getId(),
                whiteCard.getText()
        );
    }
}
