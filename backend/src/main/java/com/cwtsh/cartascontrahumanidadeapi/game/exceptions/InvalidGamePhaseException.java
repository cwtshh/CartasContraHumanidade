package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class InvalidGamePhaseException extends RuntimeException {
    public InvalidGamePhaseException() { super("Ação inválida para a fase atual do jogo."); }
}