package com.cwtsh.cartascontrahumanidadeapi.card.dto;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.BlackCard;

import java.util.UUID;

public record BlackCardResponse(
        UUID id,
        String text,
        Integer pick
) {

    public static BlackCardResponse from(BlackCard card) {
        return new BlackCardResponse(
                card.getId(),
                card.getText(),
                card.getPick()
        );
    }
}