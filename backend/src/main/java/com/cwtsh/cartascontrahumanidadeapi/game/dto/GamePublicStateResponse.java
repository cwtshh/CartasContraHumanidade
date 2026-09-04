package com.cwtsh.cartascontrahumanidadeapi.game.dto;

import com.cwtsh.cartascontrahumanidadeapi.game.domain.GamePhase;
import com.cwtsh.cartascontrahumanidadeapi.game.domain.GameSession;

import java.util.List;
import java.util.UUID;

public record GamePublicStateResponse(
        UUID gameSessionId,
        Integer roundNumber,
        GamePhase phase,
        UUID czarPlayerId,
        BlackCardInfo blackCard,
        List<PlayerScore> scores,
        int totalSubmissions,
        int expectedSubmissions,
        List<RevealedSubmission> submissions,
        UUID winningPlayerId
) {

    public record BlackCardInfo(UUID id, String text, Integer pick) {}

    public record PlayerScore(UUID roomPlayerId, Integer score) {}

    public record RevealedSubmission(UUID submissionId, List<UUID> cardIds, UUID roomPlayerId) {}

    public static GamePublicStateResponse from(GameSession session) {
        List<PlayerScore> scores = session.getHands().stream()
                .map(h -> new PlayerScore(h.getRoomPlayer().getId(), h.getScore()))
                .toList();

        boolean revealSubmissions = session.getPhase() == GamePhase.JUDGING
                || session.getPhase() == GamePhase.REVEALING_WINNER;

        boolean revealAuthor = session.getPhase() == GamePhase.REVEALING_WINNER;

        List<RevealedSubmission> submissions = revealSubmissions
                ? session.getSubmissions().stream()
                        .map(s -> new RevealedSubmission(
                                s.getId(),
                                List.copyOf(s.getSubmittedCardIds()),
                                revealAuthor ? s.getRoomPlayerId() : null
                        ))
                        .toList()
                : List.of();

        return new GamePublicStateResponse(
                session.getId(),
                session.getRoundNumber(),
                session.getPhase(),
                session.getCzarPlayerId(),
                new BlackCardInfo(
                        session.getCurrentBlackCard().getId(),
                        session.getCurrentBlackCard().getText(),
                        session.getCurrentBlackCard().getPick()
                ),
                scores,
                session.getSubmissions().size(),
                session.getHands().size() - 1,
                submissions,
                session.getWinningPlayerId()
        );
    }
}
