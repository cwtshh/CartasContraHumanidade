package com.cwtsh.cartascontrahumanidadeapi.room.websocket;

import com.cwtsh.cartascontrahumanidadeapi.room.service.RoomPresenceService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class RoomPresenceListener {
    private final RoomPresenceService roomPresenceService;

    public RoomPresenceListener(RoomPresenceService roomPresenceService) {
        this.roomPresenceService = roomPresenceService;
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String userId = (String) accessor.getSessionAttributes().get(StompAuthChannelInterceptor.USER_ID_ATTRIBUTE);
        String guestId = (String) accessor.getSessionAttributes().get(StompAuthChannelInterceptor.GUEST_ID_ATTRIBUTE);
        String roomCode = (String) accessor.getSessionAttributes().get("roomCode");

        if(roomCode == null) {
            return;
        }

        roomPresenceService.markDisconnected(roomCode, userId, guestId);
    }
}
