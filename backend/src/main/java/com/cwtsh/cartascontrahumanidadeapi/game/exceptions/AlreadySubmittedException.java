package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class AlreadySubmittedException extends RuntimeException {
    public AlreadySubmittedException() { super("Você já submeteu suas cartas nesta rodada."); }
}