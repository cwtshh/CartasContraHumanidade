package com.cwtsh.cartascontrahumanidadeapi.room.exceptions;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException() {
        super("Sala não encontrada, verifique seu codigo");
    }
}
