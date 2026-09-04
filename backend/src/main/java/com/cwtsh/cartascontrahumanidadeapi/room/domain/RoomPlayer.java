package com.cwtsh.cartascontrahumanidadeapi.room.domain;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "room_players",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_players_room_user",
                        columnNames = {"room_id", "user_id"}
                ),
                @UniqueConstraint(
                        name = "uk_room_players_room_guest",
                        columnNames = {"room_id", "guest_id"}
                )
        },
        indexes = {
                @Index(name = "idx_room_players_room_id", columnList = "room_id"),
                @Index(name = "idx_room_players_user_id", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "room_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_room_players_room")
    )
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(
            name = "user_id",
            nullable = true,
            foreignKey = @ForeignKey(name = "fk_room_players_user")
    )
    private User user;

    @Column(name = "guest_id", length = 36)
    private String guestId;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomPlayerRole role;

    @Builder.Default
    @Column(nullable = false)
    private Boolean connected = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column
    private Instant disconnectedAt;

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

    public boolean isGuest() {
        return user == null;
    }

    public void markConnected() {
        connected = true;
        disconnectedAt = null;
    }

    public void markDisconnected() {
        if (connected) {
            connected = false;
            disconnectedAt = Instant.now();
        }
    }
}