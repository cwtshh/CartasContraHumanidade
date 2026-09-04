package com.cwtsh.cartascontrahumanidadeapi.room.controller;

import com.cwtsh.cartascontrahumanidadeapi.room.service.RoomPresenceService;
import com.cwtsh.cartascontrahumanidadeapi.room.websocket.StompAuthChannelInterceptor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
public class RoomWebSocketController {
    private final RoomPresenceService roomPresenceService;

    public RoomWebSocketController(RoomPresenceService roomPresenceService) {
        this.roomPresenceService = roomPresenceService;
    }

    @MessageMapping("/rooms/{code}/enter")
    public void enterRoom(
            @DestinationVariable String code,
            SimpMessageHeaderAccessor accessor
    ) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        sessionAttributes.put("roomCode", code);

        String userId = (String) sessionAttributes.get(StompAuthChannelInterceptor.USER_ID_ATTRIBUTE);
        String guestId = (String) sessionAttributes.get(StompAuthChannelInterceptor.GUEST_ID_ATTRIBUTE);

        UUID roomPlayerId = roomPresenceService.markConnectedAndBroadcast(code, userId, guestId);

        if (roomPlayerId != null) {
            sessionAttributes.put("roomPlayerId", roomPlayerId.toString());
        }
    }
}
