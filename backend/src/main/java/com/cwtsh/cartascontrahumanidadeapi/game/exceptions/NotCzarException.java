package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class NotCzarException extends RuntimeException {
    public NotCzarException() { super("Apenas o Card Czar pode escolher o vencedor."); }
}