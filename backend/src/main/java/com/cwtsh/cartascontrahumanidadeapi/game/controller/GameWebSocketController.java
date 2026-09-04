package com.cwtsh.cartascontrahumanidadeapi.game.controller;

import com.cwtsh.cartascontrahumanidadeapi.game.dto.ChooseWinnerRequest;
import com.cwtsh.cartascontrahumanidadeapi.game.dto.GameActionResult;
import com.cwtsh.cartascontrahumanidadeapi.game.dto.SubmitCardsRequest;
import com.cwtsh.cartascontrahumanidadeapi.game.service.GameService;
import com.cwtsh.cartascontrahumanidadeapi.room.websocket.StompAuthChannelInterceptor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(
            GameService gameService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/rooms/{code}/game/start")
    public void startGame(
            @DestinationVariable String code,
            SimpMessageHeaderAccessor accessor
    ) {
        runAction(code, () -> {
            UUID playerId = extractRoomPlayerId(accessor);
            return gameService.startGame(code, playerId);
        });
    }

    @MessageMapping("/rooms/{code}/game/submit")
    public void submitCards(
            @DestinationVariable String code,
            @Payload SubmitCardsRequest request,
            SimpMessageHeaderAccessor accessor
    ) {
        runAction(code, () -> {
            UUID playerId = extractRoomPlayerId(accessor);
            return gameService.submitCards(code, playerId, request.cardIds());
        });
    }

    @MessageMapping("/rooms/{code}/game/choose-winner")
    public void chooseWinner(
            @DestinationVariable String code,
            @Payload ChooseWinnerRequest request,
            SimpMessageHeaderAccessor accessor
    ) {
        runAction(code, () -> {
            UUID playerId = extractRoomPlayerId(accessor);
            return gameService.chooseWinner(code, playerId, request.winningSubmissionId());
        });
    }

    @MessageMapping("/rooms/{code}/game/next-round")
    public void nextRound(
            @DestinationVariable String code,
            SimpMessageHeaderAccessor accessor
    ) {
        runAction(code, () -> {
            UUID playerId = extractRoomPlayerId(accessor);
            return gameService.startNextRound(code, playerId);
        });
    }

    private void runAction(String code, GameAction action) {
        try {
            GameActionResult result = action.run();
            broadcastAndDispatch(code, result);
        } catch (Exception ex) {
            messagingTemplate.convertAndSend(
                    "/topic/rooms/" + code + "/game/error",
                    ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName()
            );
        }
    }

    @FunctionalInterface
    private interface GameAction {
        GameActionResult run();
    }

    private void broadcastAndDispatch(String code, GameActionResult result) {
        if (result == null) {
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + code + "/game",
                result.publicState()
        );

        result.privateStates().forEach((roomPlayerId, privateState) ->
                messagingTemplate.convertAndSend(
                        "/topic/rooms/" + code + "/game/hand/" + roomPlayerId,
                        privateState
                )
        );
    }

    private UUID extractRoomPlayerId(SimpMessageHeaderAccessor accessor) {
        Object roomPlayerId = accessor.getSessionAttributes().get("roomPlayerId");

        if (roomPlayerId == null) {
            throw new IllegalStateException("roomPlayerId não encontrado na sessão.");
        }

        return UUID.fromString(roomPlayerId.toString());
    }
}
