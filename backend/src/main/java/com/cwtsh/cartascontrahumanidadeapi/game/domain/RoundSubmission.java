package com.cwtsh.cartascontrahumanidadeapi.game.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "round_submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_round_submissions_session_player",
                        columnNames = {"game_session_id", "room_player_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "game_session_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_round_submissions_session")
    )
    private GameSession gameSession;

    @Column(name = "room_player_id", nullable = false)
    private UUID roomPlayerId;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
            name = "round_submission_cards",
            joinColumns = @JoinColumn(name = "submission_id")
    )
    @Column(name = "white_card_id")
    @OrderColumn(name = "card_order")
    private List<UUID> submittedCardIds = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}