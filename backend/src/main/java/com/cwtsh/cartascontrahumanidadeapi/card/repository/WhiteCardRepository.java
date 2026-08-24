package com.cwtsh.cartascontrahumanidadeapi.card.repository;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.WhiteCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WhiteCardRepository
        extends JpaRepository<WhiteCard, UUID> {
}