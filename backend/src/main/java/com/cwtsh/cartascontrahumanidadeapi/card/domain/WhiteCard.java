package com.cwtsh.cartascontrahumanidadeapi.card.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(
        name = "white_cards",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_white_cards_source_id",
                        columnNames = "source_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhiteCard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "source_id", nullable = false)
    private Integer sourceId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "white_card_categories",
            joinColumns = @JoinColumn(name = "white_card_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Set<PrejudiceCategory> categories = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
