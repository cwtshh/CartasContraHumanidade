package com.cwtsh.cartascontrahumanidadeapi.room.websocket;

import com.cwtsh.cartascontrahumanidadeapi.auth.security.AuthenticatedUser;
import lombok.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    public static final String GUEST_ID_ATTRIBUTE = "guestId";
    public static final String USER_ID_ATTRIBUTE = "userId";
    public static final String DISPLAY_NAME_ATTRIBUTE = "displayName";

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel messageChannel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if(accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            resolveIdentity(accessor);
        }

        return message;
    }

    private void resolveIdentity(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();

        if(principal instanceof Authentication authentication
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            accessor.getSessionAttributes().put(USER_ID_ATTRIBUTE, user.id().toString());
            accessor.getSessionAttributes().put(DISPLAY_NAME_ATTRIBUTE, user.displayName());
            return;
        }

        String guestId = accessor.getFirstNativeHeader("X-Guest-Id");
        String displayName = accessor.getFirstNativeHeader("X-Guest-Name");

        accessor.getSessionAttributes().put(GUEST_ID_ATTRIBUTE, guestId);
        accessor.getSessionAttributes().put(DISPLAY_NAME_ATTRIBUTE, displayName);
    }
}
