package com.cwtsh.cartascontrahumanidadeapi.game.exceptions;

public class InvalidSubmissionSizeException extends RuntimeException {
    public InvalidSubmissionSizeException(int expected) {
        super("Esta carta exige exatamente " + expected + " carta(s) branca(s).");
    }
}