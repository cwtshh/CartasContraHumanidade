package com.cwtsh.cartascontrahumanidadeapi.room.repository;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByCode(String code);

    boolean existsByCode(String code);

    Page<Room> findByStatus(RoomStatus status, Pageable pageable);

    List<Room> findByEmptyAtIsNotNullAndEmptyAtBefore(Instant threshold);
}