package com.cwtsh.cartascontrahumanidadeapi.stats.domain;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.PrejudiceCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "user_prejudice_stats",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_prejudice_stats_user_category",
                        columnNames = {"user_id", "category"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPrejudiceStat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrejudiceCategory category;

    @Builder.Default
    @Column(nullable = false)
    private Long count = 0L;
}
