package com.cwtsh.cartascontrahumanidadeapi.game.dto;

import java.util.List;
import java.util.UUID;

public record SubmitCardsRequest(List<UUID> cardIds) {}