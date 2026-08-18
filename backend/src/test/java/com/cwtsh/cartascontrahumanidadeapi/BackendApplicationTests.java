package com.cwtsh.cartascontrahumanidadeapi;

import com.cwtsh.cartascontrahumanidadeapi.auth.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private TokenService tokenService;

    @Test
    void contextLoads() {
        assertNotNull(tokenService);
    }

    @Test
    void shouldGenerateDifferentTokens() {
        String firstToken = tokenService.generateToken();
        String secondToken = tokenService.generateToken();

        assertNotNull(firstToken);
        assertNotNull(secondToken);
        assertNotEquals(firstToken, secondToken);
    }

    @Test
    void shouldGenerateSameHashForSameToken() {
        String token = tokenService.generateToken();

        String firstHash = tokenService.hash(token);
        String secondHash = tokenService.hash(token);

        assertNotNull(firstHash);
        assertEquals(firstHash, secondHash);
        assertEquals(64, firstHash.length());
    }

    @Test
    void shouldGenerateDifferentHashesForDifferentTokens() {
        String firstToken = tokenService.generateToken();
        String secondToken = tokenService.generateToken();

        String firstHash = tokenService.hash(firstToken);
        String secondHash = tokenService.hash(secondToken);

        assertNotEquals(firstHash, secondHash);
    }
}