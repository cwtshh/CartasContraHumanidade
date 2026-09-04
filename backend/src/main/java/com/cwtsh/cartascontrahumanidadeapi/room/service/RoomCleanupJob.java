package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class RoomCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(RoomCleanupJob.class);

    private static final long CHECK_INTERVAL_MS = 10_000L;

    private static final int DISCONNECTED_PLAYER_TTL_SECONDS = 15;
    private static final int EMPTY_ROOM_TTL_MINUTES = 2;
    private static final int WAITING_ROOM_TTL_MINUTES = 20;

    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final RoomPlayerLifeCicleService roomPlayerLifecycleService;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomCleanupJob(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            RoomPlayerLifeCicleService roomPlayerLifecycleService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.roomRepository = roomRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomPlayerLifecycleService = roomPlayerLifecycleService;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = CHECK_INTERVAL_MS)
    @Transactional
    public void runCleanup() {
        removeDisconnectedPlayers();
        deleteEmptyRooms();
        deleteStaleWaitingRooms();
    }

    @Transactional
    public void removeDisconnectedPlayers() {
        Instant threshold = Instant.now().minus(
                DISCONNECTED_PLAYER_TTL_SECONDS,
                ChronoUnit.SECONDS
        );

        List<RoomPlayer> expiredPlayers =
                roomPlayerRepository.findByConnectedFalseAndDisconnectedAtBefore(threshold);

        Set<Room> affectedRooms = new LinkedHashSet<>();

        for (RoomPlayer player : expiredPlayers) {
            Room room = player.getRoom();
            roomPlayerLifecycleService.removePlayer(room, player);
            affectedRooms.add(room);
        }

        for (Room room : affectedRooms) {
            if (roomRepository.existsById(room.getId())) {
                messagingTemplate.convertAndSend(
                        "/topic/rooms/" + room.getCode(),
                        RoomResponse.from(room)
                );
            }
        }

        if (!expiredPlayers.isEmpty()) {
            log.info("Removidos {} jogadores desconectados há mais de {} segundos.",
                    expiredPlayers.size(),
                    DISCONNECTED_PLAYER_TTL_SECONDS
            );
        }
    }

    @Transactional
    public void deleteEmptyRooms() {
        Instant threshold = Instant.now().minus(
                EMPTY_ROOM_TTL_MINUTES,
                ChronoUnit.MINUTES
        );

        List<Room> expiredRooms =
                roomRepository.findByEmptyAtIsNotNullAndEmptyAtBefore(threshold);

        if (expiredRooms.isEmpty()) {
            return;
        }

        roomRepository.deleteAll(expiredRooms);

        log.info("Removidas {} salas vazias há mais de {} minutos.",
                expiredRooms.size(),
                EMPTY_ROOM_TTL_MINUTES
        );
    }

    @Transactional
    public void deleteStaleWaitingRooms() {
        Instant threshold = Instant.now().minus(
                WAITING_ROOM_TTL_MINUTES,
                ChronoUnit.MINUTES
        );

        List<Room> staleRooms =
                roomRepository.findByStatusAndCreatedAtBefore(RoomStatus.WAITING, threshold);

        if (staleRooms.isEmpty()) {
            return;
        }

        roomRepository.deleteAll(staleRooms);

        log.info("Removidas {} salas em espera há mais de {} minutos sem iniciar.",
                staleRooms.size(),
                WAITING_ROOM_TTL_MINUTES
        );
    }
}