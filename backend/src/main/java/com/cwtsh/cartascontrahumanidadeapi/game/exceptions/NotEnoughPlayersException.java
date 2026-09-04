package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class NotEnoughPlayersException extends RuntimeException {
    public NotEnoughPlayersException() { super("Mínimo de 3 jogadores para iniciar."); }
}
