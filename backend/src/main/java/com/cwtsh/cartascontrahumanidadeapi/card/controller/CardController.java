package com.cwtsh.cartascontrahumanidadeapi.card.controller;

import com.cwtsh.cartascontrahumanidadeapi.card.dto.WhiteCardResponse;
import com.cwtsh.cartascontrahumanidadeapi.card.repository.WhiteCardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    private final WhiteCardRepository whiteCardRepository;

    public CardController(WhiteCardRepository whiteCardRepository) {
        this.whiteCardRepository = whiteCardRepository;
    }

    @GetMapping("/white")
    public ResponseEntity<List<WhiteCardResponse>> findWhiteCards(
            @RequestParam List<UUID> ids
    ) {
        List<WhiteCardResponse> cards = whiteCardRepository.findAllById(ids).stream()
                .map(WhiteCardResponse::from)
                .toList();

        return ResponseEntity.ok(cards);
    }
}
