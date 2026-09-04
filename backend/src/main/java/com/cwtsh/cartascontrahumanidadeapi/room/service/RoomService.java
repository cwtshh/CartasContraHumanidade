package com.cwtsh.cartascontrahumanidadeapi.room.service;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.auth.repository.UserRepository;
import com.cwtsh.cartascontrahumanidadeapi.auth.security.AuthenticatedUser;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayerRole;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.CreateRoomRequest;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.PageResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomSummaryResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.InvalidGuestIdentityException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomAlreadyStartedException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomFullException;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomNotFoundException;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.security.GuestIdentity;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private static final int DEFAULT_MAX_PLAYERS = 8;
    private static final int DEFAULT_TARGET_SCORE = 7;
    private static final int MIN_TARGET_SCORE = 3;
    private static final int MAX_TARGET_SCORE = 20;

    private final RoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final RoomCodeGenerator roomCodeGenerator;
    private final UserRepository userRepository;
    private final RoomPlayerLifeCicleService roomPlayerLifecycleService;

    public RoomService(
            RoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            RoomCodeGenerator roomCodeGenerator,
            UserRepository userRepository,
            RoomPlayerLifeCicleService roomPlayerLifecycleService
    ) {
        this.roomRepository = roomRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomCodeGenerator = roomCodeGenerator;
        this.userRepository = userRepository;
        this.roomPlayerLifecycleService = roomPlayerLifecycleService;
    }

    @Transactional
    public RoomResponse createRoom(
            CreateRoomRequest request,
            AuthenticatedUser user,
            GuestIdentity guest
    ) {
        validateIdentity(user, guest);

        String code = generateUniqueCode();

        int maxPlayers = request.maxPlayers() != null ? request.maxPlayers() : DEFAULT_MAX_PLAYERS;
        int targetScore = request.targetScore() != null
                ? (int) Math.clamp(request.targetScore(), MIN_TARGET_SCORE, MAX_TARGET_SCORE)
                : DEFAULT_TARGET_SCORE;

        Room room = Room.builder()
                .code(code)
                .name(request.name())
                .status(RoomStatus.WAITING)
                .maxPlayers(maxPlayers)
                .targetScore(targetScore)
                .build();

        RoomPlayer hostPlayer = buildPlayer(user, guest, RoomPlayerRole.HOST);

        room.addPlayer(hostPlayer);

        Room saved = roomRepository.save(room);

        return RoomResponse.from(saved);
    }

    @Transactional
    public RoomResponse joinRoom(String code, AuthenticatedUser user, GuestIdentity guest) {
        validateIdentity(user, guest);

        Room room = roomRepository.findByCode(code).orElseThrow(RoomNotFoundException::new);

        if(room.getStatus() != RoomStatus.WAITING) {
            throw new RoomAlreadyStartedException();
        }

        boolean aleradyJoined = (user != null) ? roomPlayerRepository.existsByRoomIdAndUserId(room.getId(), user.id())
                : roomPlayerRepository.existsByRoomIdAndGuestId(room.getId(), guest.guestId());

        if(aleradyJoined) {
            return RoomResponse.from(room);
        }

        long currentPlayers = roomPlayerRepository.countByRoomId(room.getId());

        if(currentPlayers >= room.getMaxPlayers()) {
            throw new RoomFullException();
        }

        RoomPlayerRole role = currentPlayers == 0 ? RoomPlayerRole.HOST : RoomPlayerRole.PLAYER;
        RoomPlayer player = buildPlayer(user, guest, role);

        room.addPlayer(player);

        Room saved = roomRepository.save(room);

        return RoomResponse.from(saved);
    }


    @Transactional
    public void leaveRoom(String code, AuthenticatedUser user, String guestId) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(RoomNotFoundException::new);

        RoomPlayer player = (user != null)
                ? roomPlayerRepository.findByRoomIdAndUserId(room.getId(), user.id())
                .orElseThrow(RoomNotFoundException::new)
                : roomPlayerRepository.findByRoomIdAndGuestId(room.getId(), guestId)
                .orElseThrow(RoomNotFoundException::new);

        roomPlayerLifecycleService.removePlayer(room, player);
    }

    @Transactional
    public RoomResponse findByCOde(String code) {
        Room room = roomRepository.findByCode(code).orElseThrow(RoomNotFoundException::new);

        return RoomResponse.from(room);
    }

    @Transactional
    public PageResponse<RoomSummaryResponse> findRecentRooms(int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Room> rooms = roomRepository.findByStatus(RoomStatus.WAITING, pageable);

        Page<RoomSummaryResponse> mapped = rooms.map(RoomSummaryResponse::from);

        return PageResponse.from(mapped);
    }

    private RoomPlayer buildPlayer(AuthenticatedUser user, GuestIdentity guest, RoomPlayerRole role) {
        if(user != null) {
            User userRef = userRepository.getReferenceById(user.id());

            return RoomPlayer.builder()
                    .user(userRef)
                    .displayName(user.displayName())
                    .role(role)
                    .build();
        }

        return RoomPlayer.builder()
                .guestId(guest.guestId())
                .displayName(guest.displayName())
                .role(role)
                .build();
    }

    private void validateIdentity(AuthenticatedUser user, GuestIdentity guest) {
        if(user != null) {
            return;
        }

        if(guest == null
                || guest.guestId() == null || guest.guestId().isBlank()
                || guest.displayName() == null || guest.displayName().isBlank()) {
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
