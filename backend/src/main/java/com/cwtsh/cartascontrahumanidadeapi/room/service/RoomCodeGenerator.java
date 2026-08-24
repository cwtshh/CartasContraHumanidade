package com.cwtsh.cartascontrahumanidadeapi.room.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class RoomCodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGHT = 6;
    private final SecureRandom random = new SecureRandom();

    public String generate() {
        StringBuilder builder = new StringBuilder(LENGHT);

        for(int i = 0; i < LENGHT; i++) {
            int index = random.nextInt(CHARACTERS.length());
            builder.append(CHARACTERS.charAt(index));
        }

        return builder.toString();
    }
}
