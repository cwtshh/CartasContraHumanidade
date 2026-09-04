package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class InvalidWinnerException extends RuntimeException {
    public InvalidWinnerException() { super("Submissão vencedora inválida."); }
}