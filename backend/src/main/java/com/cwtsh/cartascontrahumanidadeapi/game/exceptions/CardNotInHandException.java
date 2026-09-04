package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class CardNotInHandException extends RuntimeException {
    public CardNotInHandException() { super("Carta não pertence à sua mão."); }
}
