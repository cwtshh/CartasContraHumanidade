package com.cwtsh.cartascontrahumanidadeapi.auth.repository;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Verification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface VerificationRepository extends JpaRepository<Verification, UUID> {

    Optional<Verification> findByIdentifierAndValueHashAndExpiresAtAfter(
            String identifier,
            String valueHash,
            Instant now
    );

    void deleteByIdentifier(String identifier);

    long deleteByExpiresAtBefore(Instant now);
}