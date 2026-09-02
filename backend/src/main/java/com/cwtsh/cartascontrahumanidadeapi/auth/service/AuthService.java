package com.cwtsh.cartascontrahumanidadeapi.auth.service;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Account;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.AuthProvider;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Session;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.auth.dto.SignInRequest;
import com.cwtsh.cartascontrahumanidadeapi.auth.dto.SignUpRequest;
import com.cwtsh.cartascontrahumanidadeapi.auth.dto.UserResponse;
import com.cwtsh.cartascontrahumanidadeapi.auth.repository.AccountRepository;
import com.cwtsh.cartascontrahumanidadeapi.auth.repository.SessionRepository;
import com.cwtsh.cartascontrahumanidadeapi.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private static final Duration SESSION_DURATION = Duration.ofDays(7);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final SessionRepository sessionRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            AccountRepository accountRepository,
            SessionRepository sessionRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.sessionRepository = sessionRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthenticationResult signUp(
            SignUpRequest request,
            String ipAddress,
            String userAgent
    ) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if(userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Este email já está em uso");
        }

        User user = User.builder().displayName(request.name().trim()).email(normalizedEmail).build();

        user = userRepository.save(user);

        Account account = Account.builder()
                .user(user)
                .provider(AuthProvider.CREDENTIAL)
                .providerAccountId(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        accountRepository.save(account);

        String rawSessionToken = tokenService.generateToken();

        Session session = Session.builder()
                .user(user)
                .tokenHash(tokenService.hash(rawSessionToken))
                .expiresAt(Instant.now().plus(SESSION_DURATION))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        sessionRepository.save(session);

        return new AuthenticationResult(
                UserResponse.from(user),
                rawSessionToken
        );
    }

    @Transactional
    public AuthenticationResult signIn(
            SignInRequest request,
            String ipAddress,
            String userAgent
    ) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        Account account = accountRepository.findByProviderAndProviderAccountId(
                AuthProvider.CREDENTIAL,
                normalizedEmail
        ).orElseThrow(() ->  new IllegalArgumentException("Email ou senha inválidos"));

        if(account.getPasswordHash() == null || !passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new IllegalArgumentException("Email ou senha inválidos");
        }

        sessionRepository.deleteAllByUserId(account.getUser().getId());

        String rawSessiontoken = tokenService.generateToken();

        Session session = Session.builder()
                .user(account.getUser())
                .tokenHash(tokenService.hash(rawSessiontoken))
                .expiresAt(Instant.now().plus(SESSION_DURATION))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        sessionRepository.save(session);

        return new AuthenticationResult(
                UserResponse.from(account.getUser()),
                rawSessiontoken
        );
    }

    @Transactional
    public void signOut(String rawSessiontoken) {
        if (rawSessiontoken == null || rawSessiontoken.isBlank()) {
            return;
        }

        String tokenHash = tokenService.hash(rawSessiontoken);

        sessionRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public void signOutAll(UUID userId) {
        sessionRepository.deleteAllByUserId(userId);
    }
}
