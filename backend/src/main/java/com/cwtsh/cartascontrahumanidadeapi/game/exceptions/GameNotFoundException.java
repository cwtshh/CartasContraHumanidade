package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException() { super("Jogo não encontrado."); }
}