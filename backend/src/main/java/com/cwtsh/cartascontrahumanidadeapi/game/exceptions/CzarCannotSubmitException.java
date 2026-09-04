package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class CzarCannotSubmitException extends RuntimeException {
    public CzarCannotSubmitException() { super("O Card Czar não pode submeter cartas."); }
}