package com.cwtsh.cartascontrahumanidadeapi.auth.repository;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.Account;
import com.cwtsh.cartascontrahumanidadeapi.auth.domain.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByProviderAndProviderAccountId(
            AuthProvider provider,
            String providerAccountId
    );
}