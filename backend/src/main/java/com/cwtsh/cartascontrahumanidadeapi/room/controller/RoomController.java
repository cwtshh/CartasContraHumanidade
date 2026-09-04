package com.cwtsh.cartascontrahumanidadeapi.room.controller;

import com.cwtsh.cartascontrahumanidadeapi.auth.security.AuthenticatedUser;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.*;
import com.cwtsh.cartascontrahumanidadeapi.room.security.GuestIdentity;
import com.cwtsh.cartascontrahumanidadeapi.room.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestHeader(value = "X-Guest-Id", required = false)
            String guestId
            ) {
        GuestIdentity guest = (user == null) ? new GuestIdentity(guestId, request.guestDisplayName()) : null;

        return ResponseEntity.ok(
                roomService.createRoom(request, user, guest)
        );
    };

    @GetMapping
    public ResponseEntity<PageResponse<RoomSummaryResponse>> findRecentRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                roomService.findRecentRooms(page, size)
        );
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @RequestBody JoinRoomRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestHeader(value = "X-Guest-Id", required = false)
            String guestId
            ) {
        GuestIdentity guest = (user == null) ? new GuestIdentity(guestId, request.guestDisplayName())
                : null;
        return ResponseEntity.ok(
                roomService.joinRoom(request.code(), user, guest)
        );
    }

    @DeleteMapping("/{code}/leave")
    public ResponseEntity<Void> leaveRoomo(
            @PathVariable String code,
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestHeader(value = "X-Guest-Id", required = false)
            String guestId
    ) {
        roomService.leaveRoom(code, user, guestId);
        return ResponseEntity.noContent().build();
    }
}
