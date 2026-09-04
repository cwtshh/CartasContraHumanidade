package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.game.repository.GamePlayerHandRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayerRole;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class RoomPlayerLifeCicleService {
    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final GamePlayerHandRepository gamePlayerHandRepository;

    public RoomPlayerLifeCicleService(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            GamePlayerHandRepository gamePlayerHandRepository
    ) {
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomRepository = roomRepository;
        this.gamePlayerHandRepository = gamePlayerHandRepository;
    }

    @Transactional
    public void removePlayer(Room room, RoomPlayer player) {
        boolean wasHost = player.getRole() == RoomPlayerRole.HOST;

        room.removePlayer(player);
        gamePlayerHandRepository.deleteByRoomPlayerId(player.getId());
        roomPlayerRepository.delete(player);

        if(room.getPlayers().isEmpty()) {
            room.markEmptyNow();
            roomRepository.save(room);
            return;
        }

        if(wasHost) {
            promoteNextHost(room);
        }

        if(!room.hasConnectedPlayers()) {
            room.markEmptyNow();
        }

        roomRepository.save(room);
    }

    private void promoteNextHost(Room room) {
        RoomPlayer nextHost = room.getPlayers().stream()
                .filter(RoomPlayer::getConnected)
                .findFirst()
                .orElseGet(() -> room.getPlayers().get(0));

        nextHost.setRole(RoomPlayerRole.HOST);
        roomPlayerRepository.save(nextHost);
    }
}
