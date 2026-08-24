package com.cwtsh.cartascontrahumanidadeapi.room.controller;

import com.cwtsh.cartascontrahumanidadeapi.auth.domain.User;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.CreateRoomRequest;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.JoinRoomRequest;
import com.cwtsh.cartascontrahumanidadeapi.room.dto.RoomResponse;
import com.cwtsh.cartascontrahumanidadeapi.room.security.GuestIdentity;
import com.cwtsh.cartascontrahumanidadeapi.room.service.RoomService;
import org.apache.coyote.Response;
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
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Guest_Id", required = false)
            String guestId
            ) {
        GuestIdentity guest = (user == null) ? new GuestIdentity(guestId, request.guestDisplayName()) : null;

        return ResponseEntity.ok(
                roomService.createRoom(request, user, guest)
        );
    };

    @PostMapping("/join")
    public Response<RoomResponse> joinRoom(
            @RequestBody JoinRoomRequest request,
            @AuthenticationPrincipal User user,
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
    public ResponseEntity<void> leaveRoomo(
            @PathVariable String code,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Guest-Id", required = false)
            String guestId
    ) {
        roomService.leaveRoom(code, user, guestId);
        return ResponseEntity.noContent().build();
    }
}
