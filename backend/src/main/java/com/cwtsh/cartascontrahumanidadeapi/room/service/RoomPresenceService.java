package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomPresenceService {
    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public RoomPresenceService(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            SimpMessagingTemplate simpMessagingTemplate
    ) {
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomRepository = roomRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Transactional
    public void markConnectedAndBrodcast(String roomCode, String userId, String guestId, boolean connected) {
        Room room = roomRepository.findByCode(roomCode).orElse(null);

        if(room == null) {
            return;
        }

        RoomPlayer player = findPlayer(room, userId, guestId);

        if(player != null) {
            player.setConnected(connected);
            roomPlayerRepository.save(player);
        }

        broadcastRoomState(room);
    }

    private RoomPlayer findPlayer(Room room, String userId, String guestId) {
        if(userId != null) {
            return roomPlayerRepository.findByRoomIdAndUserId(room.getId(), UUID.fromString(userId)).orElse(null);
        }

        if(guestId != null) {
            return roomPlayerRepository.findByRoomIdAndGuestId(room.getId(), guestId).orElse(null);
        }

        return null;
    }

    private void broadcastRoomState(Room room) {
        RoomResponse response = RoomResponse.from(room);

        simpMessagingTemplate.convertAndSend("/topic/rooms/" + room.getCode(), response);
    }
}
