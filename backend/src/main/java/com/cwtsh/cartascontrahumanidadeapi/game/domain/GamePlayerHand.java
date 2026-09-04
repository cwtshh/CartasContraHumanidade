package com.cwtsh.cartascontrahumanidadeapi.game.domain;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "game_player_hands",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_game_player_hands_session_player",
                        columnNames = {"game_session_id", "room_player_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamePlayerHand {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "game_session_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_game_player_hands_session")
    )
    private GameSession gameSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "room_player_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_game_player_hands_room_player")
    )
    private RoomPlayer roomPlayer;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
            name = "game_player_hand_cards",
            joinColumns = @JoinColumn(name = "hand_id")
    )
    @Column(name = "white_card_id")
    private List<UUID> cardIds = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false)
    private Integer score = 0;

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

    public void removeCards(List<UUID> cardsToRemove) {
        cardIds.removeAll(cardsToRemove);
    }

    public void addCards(List<UUID> cardsToAdd) {
        cardIds.addAll(cardsToAdd);
    }
}
