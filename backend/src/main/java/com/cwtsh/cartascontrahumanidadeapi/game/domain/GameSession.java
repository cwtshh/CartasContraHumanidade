package com.cwtsh.cartascontrahumanidadeapi.game.domain;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.BlackCard;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "room_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_game_sessions_room")
    )
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "current_black_card_id",
            foreignKey = @ForeignKey(name = "fk_game_sessions_black_card")
    )
    private BlackCard currentBlackCard;

    @Column(name = "czar_player_id")
    private UUID czarPlayerId;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GamePhase phase;

    @Column(name = "winning_player_id")
    private UUID winningPlayerId;

    @Column(name = "target_score", nullable = false)
    private Integer targetScore;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
            name = "game_session_used_black_cards",
            joinColumns = @JoinColumn(name = "game_session_id")
    )
    @Column(name = "black_card_id")
    private Set<UUID> usedBlackCardIds = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(
            name = "game_session_used_white_cards",
            joinColumns = @JoinColumn(name = "game_session_id")
    )
    @Column(name = "white_card_id")
    private Set<UUID> usedWhiteCardIds = new HashSet<>();

    @Builder.Default
    @OneToMany(
            mappedBy = "gameSession",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<GamePlayerHand> hands = new ArrayList<>();

    @Builder.Default
    @OneToMany(
            mappedBy = "gameSession",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<RoundSubmission> submissions = new ArrayList<>();

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

    public void clearSubmissionsForNewRound() {
        submissions.clear();
    }
}