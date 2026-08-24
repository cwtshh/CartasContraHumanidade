package com.cwtsh.cartascontrahumanidadeapi.room.exceptions;

public class InvalidGuestIdentityException extends RuntimeException {
    public InvalidGuestIdentityException() {
        super("Identidade inválida");
    }
}
