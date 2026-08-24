package com.cwtsh.cartascontrahumanidadeapi.room.exceptions;

public class RoomFullException extends RuntimeException {
    public RoomFullException() {
        super("A sala já está cheia");
    }
}
