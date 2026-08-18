package com.cwtsh.cartascontrahumanidadeapi.auth.repository;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query("""
        select s
        from Session s
        join fetch s.user
        where s.tokenHash = :tokenHash
          and s.expiresAt > :now
        """)
    Optional<Session> findByTokenHashAndExpiresAtAfter(
            @Param("tokenHash") String tokenHash,
            @Param("now") Instant now
    );

    long deleteByTokenHash(String tokenHash);

    void deleteAllByUserId(UUID userId);

    long deleteByExpiresAtBefore(Instant now);
}