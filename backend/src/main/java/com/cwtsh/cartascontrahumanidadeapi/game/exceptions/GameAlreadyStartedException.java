package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class GameAlreadyStartedException extends RuntimeException {
    public GameAlreadyStartedException() { super("O jogo já foi iniciado."); }
}