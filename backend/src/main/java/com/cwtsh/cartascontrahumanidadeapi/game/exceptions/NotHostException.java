package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class NotHostException extends RuntimeException {
    public NotHostException() { super("Apenas o host pode iniciar o jogo."); }
}
