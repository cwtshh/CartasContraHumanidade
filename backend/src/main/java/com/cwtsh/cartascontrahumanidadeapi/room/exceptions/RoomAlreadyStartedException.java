package com.cwtsh.cartascontrahumanidadeapi.room.exceptions;

public class RoomAlreadyStartedException extends RuntimeException {
    public RoomAlreadyStartedException() {
        super("O jogo já começou");
    }
}
