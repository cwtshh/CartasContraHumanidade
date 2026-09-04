package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class PlayerHandNotFoundException extends RuntimeException {
    public PlayerHandNotFoundException() { super("Mão do jogador não encontrada."); }
}