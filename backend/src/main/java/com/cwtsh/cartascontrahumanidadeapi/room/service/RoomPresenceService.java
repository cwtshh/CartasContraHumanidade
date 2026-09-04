package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RoomPresenceService {

    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomPresenceService(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.roomRepository = roomRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public UUID markConnectedAndBroadcast(String roomCode, String userId, String guestId) {
        Room room = roomRepository.findByCode(roomCode).orElse(null);

        if (room == null) {
            return null;
        }

        RoomPlayer player = findPlayer(room, userId, guestId);

        if (player != null) {
            player.markConnected();
            roomPlayerRepository.save(player);
            room.markNotEmpty();
            roomRepository.save(room);
        }

        broadcastRoomState(room);

        return player != null ? player.getId() : null;
    }

    @Transactional
    public void markDisconnected(String roomCode, String userId, String guestId) {
        Room room = roomRepository.findByCode(roomCode).orElse(null);

        if (room == null) {
            return;
        }

        RoomPlayer player = findPlayer(room, userId, guestId);

        if (player == null) {
            return;
        }

        player.markDisconnected();
        roomPlayerRepository.save(player);

        broadcastRoomState(room);
    }

    private RoomPlayer findPlayer(Room room, String userId, String guestId) {
        if (userId != null) {
            return roomPlayerRepository
                    .findByRoomIdAndUserId(room.getId(), UUID.fromString(userId))
                    .orElse(null);
        }

        if (guestId != null) {
            return roomPlayerRepository
                    .findByRoomIdAndGuestId(room.getId(), guestId)
                    .orElse(null);
        }

        return null;
    }

    private void broadcastRoomState(Room room) {
        RoomResponse response = RoomResponse.from(room);

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + room.getCode(),
                response
        );
    }
}