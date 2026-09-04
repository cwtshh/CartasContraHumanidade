package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class NoMoreCardsException extends RuntimeException {
    public NoMoreCardsException() { super("Não há mais cartas disponíveis."); }
}