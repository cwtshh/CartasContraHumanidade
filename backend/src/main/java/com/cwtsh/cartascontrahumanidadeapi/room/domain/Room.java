package com.cwtsh.cartascontrahumanidadeapi.room.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "rooms",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_rooms_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 8)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;

    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;

    @Builder.Default
    @OneToMany(
            mappedBy = "room",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<RoomPlayer> players = new ArrayList<>();

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

    public void addPlayer(RoomPlayer player) {
        players.add(player);
        player.setRoom(this);
    }

    public void removePlayer(RoomPlayer player) {
        players.remove(player);
        player.setRoom(null);
    }
}