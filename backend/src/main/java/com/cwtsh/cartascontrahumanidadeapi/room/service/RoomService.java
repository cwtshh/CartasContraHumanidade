package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayerRole;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.CreateRoomRequest;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.InvalidGuestIdentityException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomAlreadyStartedException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomFullException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomNotFoundException;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.security.GuestIdentity;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private static final int DEFAULT_MAX_PLAYERS = 8;

    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final RoomCodeGenerator roomCodeGenerator;

    public RoomService(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            RoomCodeGenerator roomCodeGenerator
    ) {
        this.roomRepository = roomRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomCodeGenerator = roomCodeGenerator;
    }

    @Transactional
    public RoomResponse createRoom(
            CreateRoomRequest request,
            User user,
            GuestIdentity guest
    ) {
        validateIdentity(user, guest);

        String code = generateUniqueCode();

        int maxPlayers = request.maxPlayers() != null ? request.maxPlayers() : DEFAULT_MAX_PLAYERS;

        Room room = Room.builder()
                .code(code)
                .name(request.name())
                .status(RoomStatus.WAITING)
                .maxPlayers(maxPlayers)
                .build();

        RoomPlayer hostPlayer = buildPlayer(user, guest, RoomPlayerRole.HOST);

        room.addPlayer(hostPlayer);

        Room saved = roomRepository.save(room);

        return RoomResponse.from(saved);
    }

    @Transactional
    public RoomResponse joinRoom(String code, User user, GuestIdentity guest) {
        validateIdentity(user, guest);

        Room room = roomRepository.findByCode(code).orElseThrow(RoomNotFoundException::new);

        if(room.getStatus() != RoomStatus.WAITING) {
            throw new RoomAlreadyStartedException();
        }

        boolean aleradyJoined = (user != null) ? roomPlayerRepository.existsByRoomIdAndUserId(room.getId(), user.getId())
                : roomPlayerRepository.existsByRoomIdAndGuestId(room.getId(), guest.guestId());

        if(aleradyJoined) {
            return RoomResponse.from(room);
        }

        long currentPlayers = roomPlayerRepository.countByRoomId(room.getId());

        if(currentPlayers >= room.getMaxPlayers()) {
            throw new RoomFullException();
        }

        RoomPlayer player = buildPlayer(user, guest, RoomPlayerRole.PLAYER);

        room.addPlayer(player);

        Room saved = roomRepository.save(room);

        return RoomResponse.from(saved);
    }

    @Transactional
    public void leaveRoom(String code, User user, String guestId) {
        Room room = roomRepository.findByCode(code).orElseThrow(RoomNotFoundException::new);

        RoomPlayer player = (user != null) ? roomPlayerRepository.findByRoomIdAndUserId(room.getId(), user.getId())
                : roomPlayerRepository.findByRoomIdAndGuestId(room.getId(), guestId).orElseThrow(RoomNotFoundException::new);

        room.removePlayer(player);

        if(room.getPlayers().isEmpty()) {
            roomRepository.delete(room);
            return;
        }

        if(player.getRole() == RoomPlayerRole.HOST) {
            RoomPlayer newHost = room.getPlayers().getFirst();
            newHost.setRole(RoomPlayerRole.HOST);
        }

        roomRepository.save(room);
    }

    @Transactional
    public RoomResponse findByCOde(String code) {
        Room room = roomRepository.findByCode(code).orElseThrow(RoomNotFoundException::new);

        return RoomResponse.from(room);
    }

    private RoomPlayer buildPlayer(User user, GuestIdentity guest, RoomPlayerRole role) {
        if(user != null) {
            return RoomPlayer.builder()
                    .user(user)
                    .displayName(user.getDisplayName())
                    .role(role)
                    .build();
        }

        return RoomPlayer.builder()
                .guestId(guest.guestId())
                .displayName(guest.displayName())
                .role(role)
                .build();
    }

    private void validateIdentity(User user, GuestIdentity guest) {
        if(user != null) {
            return;
        }

        if(guest == null || guest.guestId().isBlank() || guest.displayName() == null || guest.displayName().isBlank()) {
            throw new InvalidGuestIdentityException();
        }
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = roomCodeGenerator.generate();
        } while (roomRepository.existsByCode((code)));

        return code;
    }
}
