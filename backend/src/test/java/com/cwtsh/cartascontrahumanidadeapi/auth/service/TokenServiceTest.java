package com.cwtsh.cartascontrahumanidadeapi.auth.service;

import org.junit.jupiter.api.Test;

import static org.testng.Assert.assertNotEquals;
import static org.testng.AssertJUnit.assertEquals;

class TokenServiceTest {

    private final TokenService tokenService = new TokenService();

    @Test
    void shouldGenerateAndHashDifferentTokenValues() {
        String first = tokenService.generateToken();
        String second = tokenService.generateToken();

        assertNotEquals(first, second);
        assertEquals(64, tokenService.hash(first).length());
        assertEquals(tokenService.hash(first), tokenService.hash(first));
    }
}