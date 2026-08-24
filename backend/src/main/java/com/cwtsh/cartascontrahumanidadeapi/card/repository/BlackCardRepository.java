package com.cwtsh.cartascontrahumanidadeapi.card.repository;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.BlackCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BlackCardRepository
        extends JpaRepository<BlackCard, UUID> {
}