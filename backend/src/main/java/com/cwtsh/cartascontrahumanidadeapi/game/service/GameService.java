package com.cwtsh.cartascontrahumanidadeapi.game.service;

import com.cwtsh.cartascontrahumanidadeapi.card.domain.BlackCard;
import com.cwtsh.cartascontrahumanidadeapi.card.domain.WhiteCard;
import com.cwtsh.cartascontrahumanidadeapi.card.repository.BlackCardRepository;
import com.cwtsh.cartascontrahumanidadeapi.card.repository.WhiteCardRepository;
import com.cwtsh.cartascontrahumanidadeapi.game.domain.GamePhase;
import com.cwtsh.cartascontrahumanidadeapi.game.domain.GamePlayerHand;
import com.cwtsh.cartascontrahumanidadeapi.game.domain.GameSession;
import com.cwtsh.cartascontrahumanidadeapi.game.domain.RoundSubmission;
import com.cwtsh.cartascontrahumanidadeapi.game.dto.GameActionResult;
import com.cwtsh.cartascontrahumanidadeapi.game.dto.GamePrivateStateResponse;
import com.cwtsh.cartascontrahumanidadeapi.game.dto.GamePublicStateResponse;
import com.cwtsh.cartascontrahumanidadeapi.game.exceptions.*;
import com.cwtsh.cartascontrahumanidadeapi.game.repository.GamePlayerHandRepository;
import com.cwtsh.cartascontrahumanidadeapi.game.repository.GameSessionRepository;
import com.cwtsh.cartascontrahumanidadeapi.game.repository.RoundSubmissionRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.Room;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayer;
import com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomStatus;
import com.cwtsh.cartascontrahumanidadeapi.room.exceptions.RoomNotFoundException;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomPlayerRepository;
import com.cwtsh.cartascontrahumanidadeapi.room.repository.RoomRepository;
import com.cwtsh.cartascontrahumanidadeapi.stats.service.PrejudiceStatsService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GameService {

    private static final int HAND_SIZE = 5;

    private final RoomRepository roomRepository;
    private final GameSessionRepository gameSessionRepository;
    private final GamePlayerHandRepository gamePlayerHandRepository;
    private final RoundSubmissionRepository roundSubmissionRepository;
    private final WhiteCardRepository whiteCardRepository;
    private final BlackCardRepository blackCardRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final PrejudiceStatsService prejudiceStatsService;

    public GameService(
            RoomRepository roomRepository,
            GameSessionRepository gameSessionRepository,
            GamePlayerHandRepository gamePlayerHandRepository,
            RoundSubmissionRepository roundSubmissionRepository,
            WhiteCardRepository whiteCardRepository,
            BlackCardRepository blackCardRepository,
            RoomPlayerRepository roomPlayerRepository,
            PrejudiceStatsService prejudiceStatsService
    ) {
        this.roomRepository = roomRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.gamePlayerHandRepository = gamePlayerHandRepository;
        this.roundSubmissionRepository = roundSubmissionRepository;
        this.whiteCardRepository = whiteCardRepository;
        this.blackCardRepository = blackCardRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.prejudiceStatsService = prejudiceStatsService;
    }

    @Transactional
    public GameActionResult startGame(String roomCode, UUID requesterPlayerId) {
        Room room = roomRepository.findByCode(roomCode)
                .orElseThrow(RoomNotFoundException::new);

        RoomPlayer requester = findRoomPlayer(room, requesterPlayerId);
        requireHost(requester);

        if (room.getStatus() != RoomStatus.WAITING) {
            throw new GameAlreadyStartedException();
        }

        List<RoomPlayer> players = room.getPlayers();

        if (players.size() < 3) {
            throw new NotEnoughPlayersException();
        }

        List<WhiteCard> allWhiteCards = new ArrayList<>(whiteCardRepository.findAll());
        Collections.shuffle(allWhiteCards);

        if (allWhiteCards.size() < players.size() * HAND_SIZE) {
            throw new NoMoreCardsException();
        }

        GameSession session = GameSession.builder()
                .room(room)
                .roundNumber(1)
                .phase(GamePhase.SUBMITTING)
                .targetScore(room.getTargetScore())
                .build();

        int cardCursor = 0;

        for (RoomPlayer player : players) {
            List<UUID> hand = new ArrayList<>();

            for (int i = 0; i < HAND_SIZE; i++) {
                WhiteCard card = allWhiteCards.get(cardCursor++);
                hand.add(card.getId());
                session.getUsedWhiteCardIds().add(card.getId());
            }

            GamePlayerHand playerHand = GamePlayerHand.builder()
                    .gameSession(session)
                    .roomPlayer(player)
                    .cardIds(hand)
                    .build();

            session.getHands().add(playerHand);
        }

        RoomPlayer firstCzar = players.get(new Random().nextInt(players.size()));
        session.setCzarPlayerId(firstCzar.getId());

        BlackCard blackCard = drawBlackCard(session);
        session.setCurrentBlackCard(blackCard);

        room.setStatus(RoomStatus.IN_PROGRESS);

        roomRepository.save(room);
        GameSession saved = gameSessionRepository.save(session);

        return buildActionResult(saved);
    }

    @Transactional
    public GameActionResult submitCards(
            String roomCode,
            UUID playerId,
            List<UUID> cardIds
    ) {
        GameSession session = findSessionByRoomCode(roomCode);

        if (session.getPhase() != GamePhase.SUBMITTING) {
            throw new InvalidGamePhaseException();
        }

        if (playerId.equals(session.getCzarPlayerId())) {
            throw new CzarCannotSubmitException();
        }

        int expectedPick = session.getCurrentBlackCard().getPick();

        if (cardIds.size() != expectedPick) {
            throw new InvalidSubmissionSizeException(expectedPick);
        }

        GamePlayerHand hand = gamePlayerHandRepository
                .findByGameSessionIdAndRoomPlayerId(session.getId(), playerId)
                .orElseThrow(PlayerHandNotFoundException::new);

        if (!hand.getCardIds().containsAll(cardIds)) {
            throw new CardNotInHandException();
        }

        boolean alreadySubmitted = roundSubmissionRepository
                .findByGameSessionIdAndRoomPlayerId(session.getId(), playerId)
                .isPresent();

        if (alreadySubmitted) {
            throw new AlreadySubmittedException();
        }

        RoundSubmission submission = RoundSubmission.builder()
                .gameSession(session)
                .roomPlayerId(playerId)
                .submittedCardIds(new ArrayList<>(cardIds))
                .build();

        session.getSubmissions().add(submission);

        hand.removeCards(cardIds);

        recordPrejudiceStats(playerId, cardIds);

        long expectedSubmissions = session.getHands().size() - 1;
        long actualSubmissions = session.getSubmissions().size();

        if (actualSubmissions >= expectedSubmissions) {
            session.setPhase(GamePhase.JUDGING);
        }

        GameSession saved = gameSessionRepository.save(session);

        return buildActionResult(saved);
    }

    @Transactional
    public GameActionResult chooseWinner(
            String roomCode,
            UUID czarPlayerId,
            UUID winningSubmissionId
    ) {
        GameSession session = findSessionByRoomCode(roomCode);

        if (session.getPhase() != GamePhase.JUDGING) {
            throw new InvalidGamePhaseException();
        }

        if (!czarPlayerId.equals(session.getCzarPlayerId())) {
            throw new NotCzarException();
        }

        UUID winningRoomPlayerId = session.getSubmissions().stream()
                .filter(s -> s.getId().equals(winningSubmissionId))
                .map(RoundSubmission::getRoomPlayerId)
                .findFirst()
                .orElseThrow(InvalidWinnerException::new);

        GamePlayerHand winnerHand = gamePlayerHandRepository
                .findByGameSessionIdAndRoomPlayerId(session.getId(), winningRoomPlayerId)
                .orElseThrow(PlayerHandNotFoundException::new);

        winnerHand.setScore(winnerHand.getScore() + 1);
        session.setWinningPlayerId(winningRoomPlayerId);
        session.setPhase(GamePhase.REVEALING_WINNER);

        GameSession saved = gameSessionRepository.save(session);

        return buildActionResult(saved);
    }

    @Transactional
    public GameActionResult startNextRound(String roomCode, UUID requesterPlayerId) {
        GameSession session = findSessionByRoomCode(roomCode);

        if (session.getPhase() != GamePhase.REVEALING_WINNER) {
            throw new InvalidGamePhaseException();
        }

        boolean someoneReachedTarget = session.getHands().stream()
                .anyMatch(hand -> hand.getScore() >= session.getTargetScore());

        Room room = session.getRoom();

        if (someoneReachedTarget) {
            room.setStatus(RoomStatus.FINISHED);
            roomRepository.save(room);

            session.setPhase(GamePhase.FINISHED);
            GameSession saved = gameSessionRepository.save(session);

            return buildActionResult(saved);
        }

        replenishHands(session);

        List<RoomPlayer> players = room.getPlayers();
        UUID nextCzarId = pickNextCzar(players, session.getCzarPlayerId());
        session.setCzarPlayerId(nextCzarId);

        BlackCard blackCard = drawBlackCard(session);
        session.setCurrentBlackCard(blackCard);

        session.setRoundNumber(session.getRoundNumber() + 1);
        session.setPhase(GamePhase.SUBMITTING);
        session.setWinningPlayerId(null);
        session.clearSubmissionsForNewRound();

        GameSession saved = gameSessionRepository.save(session);

        return buildActionResult(saved);
    }

    private void recordPrejudiceStats(UUID roomPlayerId, List<UUID> submittedCardIds) {
        RoomPlayer player = roomPlayerRepository.findById(roomPlayerId).orElse(null);

        if (player == null || player.isGuest()) {
            return;
        }

        List<WhiteCard> submittedCards = whiteCardRepository.findAllById(submittedCardIds);
        prejudiceStatsService.recordSubmission(player.getUser().getId(), submittedCards);
    }

    private GameActionResult buildActionResult(GameSession session) {
        GamePublicStateResponse publicState = GamePublicStateResponse.from(session);

        Map<UUID, GamePrivateStateResponse> privateStates = new HashMap<>();

        for (GamePlayerHand hand : session.getHands()) {
            UUID roomPlayerId = hand.getRoomPlayer().getId();

            boolean hasSubmitted = session.getSubmissions().stream()
                    .anyMatch(s -> s.getRoomPlayerId().equals(roomPlayerId));

            privateStates.put(
                    roomPlayerId,
                    GamePrivateStateResponse.from(List.copyOf(hand.getCardIds()), session.getId(), hasSubmitted)
            );
        }

        return new GameActionResult(publicState, privateStates);
    }

    private void replenishHands(GameSession session) {
        List<WhiteCard> allWhiteCards = new ArrayList<>(whiteCardRepository.findAll());
        allWhiteCards.removeIf(card -> session.getUsedWhiteCardIds().contains(card.getId()));
        Collections.shuffle(allWhiteCards);

        int totalMissing = session.getHands().stream()
                .mapToInt(hand -> HAND_SIZE - hand.getCardIds().size())
                .sum();

        if (allWhiteCards.size() < totalMissing) {
            throw new NoMoreCardsException();
        }

        int cardCursor = 0;

        for (GamePlayerHand hand : session.getHands()) {
            int missing = HAND_SIZE - hand.getCardIds().size();

            List<UUID> newCards = new ArrayList<>();

            for (int i = 0; i < missing; i++) {
                WhiteCard card = allWhiteCards.get(cardCursor++);
                newCards.add(card.getId());
                session.getUsedWhiteCardIds().add(card.getId());
            }

            hand.addCards(newCards);
        }
    }

    private BlackCard drawBlackCard(GameSession session) {
        List<BlackCard> available = blackCardRepository.findAll();
        available.removeIf(card -> session.getUsedBlackCardIds().contains(card.getId()));

        if (available.isEmpty()) {
            throw new NoMoreCardsException();
        }

        BlackCard chosen = available.get(new Random().nextInt(available.size()));
        session.getUsedBlackCardIds().add(chosen.getId());

        return chosen;
    }

    private UUID pickNextCzar(List<RoomPlayer> players, UUID currentCzarId) {
        int currentIndex = -1;

        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).getId().equals(currentCzarId)) {
                currentIndex = i;
                break;
            }
        }

        int nextIndex = (currentIndex + 1) % players.size();
        return players.get(nextIndex).getId();
    }

    private RoomPlayer findRoomPlayer(Room room, UUID roomPlayerId) {
        return room.getPlayers().stream()
                .filter(p -> p.getId().equals(roomPlayerId))
                .findFirst()
                .orElseThrow(RoomNotFoundException::new);
    }

    private void requireHost(RoomPlayer player) {
        if (player.getRole() != com.cwtsh.cartascontrahumanidadeapi.room.domain.RoomPlayerRole.HOST) {
            throw new NotHostException();
        }
    }

    private GameSession findSessionByRoomCode(String roomCode) {
        return gameSessionRepository.findByRoomCode(roomCode)
                .orElseThrow(GameNotFoundException::new);
    }
}
