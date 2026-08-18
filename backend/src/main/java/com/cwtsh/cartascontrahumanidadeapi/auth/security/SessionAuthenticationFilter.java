package com.cwtsh.cartascontrahumanidadeapi.auth.security;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Session;
import com.cwtsh.cartascontrahumanidadeapi.auth.repository.SessionRepository;
import com.cwtsh.cartascontrahumanidadeapi.auth.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final String SESSION_COOKIE_NAME = "session_token";

    private final SessionRepository sessionRepository;
    private final TokenService tokenService;

    public SessionAuthenticationFilter(
            SessionRepository sessionRepository,
            TokenService tokenService
    ) {
        this.sessionRepository = sessionRepository;
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String rawToken = extractCookieValue(request, SESSION_COOKIE_NAME);

        if (
                rawToken != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null
        ) {
            String tokenHash = tokenService.hash(rawToken);

            Optional<Session> optionalSession =
                    sessionRepository.findByTokenHashAndExpiresAtAfter(
                            tokenHash,
                            Instant.now()
                    );

            if (optionalSession.isPresent()) {
                Session session = optionalSession.get();

                AuthenticatedUser user = AuthenticatedUser.from(
                        session.getUser()
                );

                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.role().name()
                        )
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                authorities
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                session.setLastUsedAt(Instant.now());
                sessionRepository.save(session);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractCookieValue(
            HttpServletRequest request,
            String cookieName
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}