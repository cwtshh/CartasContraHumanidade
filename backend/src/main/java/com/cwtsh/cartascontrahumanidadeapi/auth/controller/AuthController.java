package com.cwtsh.cartascontrahumanidadeapi.auth.controller;

import com.cwtsh.cartascontrahumanidadeapi.auth.dto.SignInRequest;
import com.cwtsh.cartascontrahumanidadeapi.auth.dto.SignUpRequest;
import com.cwtsh.cartascontrahumanidadeapi.auth.dto.UserResponse;
import com.cwtsh.cartascontrahumanidadeapi.auth.security.AuthenticatedUser;
import com.cwtsh.cartascontrahumanidadeapi.auth.service.AuthService;
import com.cwtsh.cartascontrahumanidadeapi.auth.service.AuthenticationResult;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String SESSION_COOKIE_NAME = "session_token";
    private static final Duration SESSION_DURATION = Duration.ofDays(7);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/sign-up")
    public ResponseEntity<UserResponse> signUp(
            @Valid @RequestBody SignUpRequest request,
            HttpServletRequest httpRequest

    ) {
        AuthenticationResult result = authService.signUp(
                request,
                getClientIp(httpRequest),
                httpRequest.getHeader(HttpHeaders.USER_AGENT)
        );

        ResponseCookie cookie = ResponseCookie
                .from(SESSION_COOKIE_NAME, result.sessionToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(SESSION_DURATION)
                .build();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.user());
    }

    @PostMapping("/sign-in")
    public ResponseEntity<UserResponse> signIn(
            @Valid @RequestBody SignInRequest reqeust,
            HttpServletRequest httpRequest
    ) {
        AuthenticationResult result = authService.signIn(
                reqeust,
                getClientIp(httpRequest),
                httpRequest.getHeader(HttpHeaders.USER_AGENT)
        );

        ResponseCookie cookie = ResponseCookie
                .from(SESSION_COOKIE_NAME, result.sessionToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(SESSION_DURATION)
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.user());
    }

    @GetMapping("/session")
    public ResponseEntity<AuthenticatedUser> session(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(user);
    }

    @PostMapping("/sign-out")
    public ResponseEntity<Void> signOut(HttpServletRequest request) {
        String rawSessionToken = getCookieValue(request, SESSION_COOKIE_NAME);

        authService.signOut(rawSessionToken);

        ResponseCookie deleteCookie = ResponseCookie
                .from(SESSION_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity
                .noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @PostMapping("/sign-out-all")
    public ResponseEntity<Void> signOutAll(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        authService.signOutAll(user.id());

        ResponseCookie deleteCookie = ResponseCookie
                .from(SESSION_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity
                .noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if(forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(";")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String getCookieValue(
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
