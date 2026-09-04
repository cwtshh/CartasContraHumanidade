export type GamePhase = "SUBMITTING" | "JUDGING" | "REVEALING_WINNER" | "FINISHED";

export type BlackCardInfo = {
  id: string;
  text: string;
  pick: number;
};

export type PlayerScore = {
  roomPlayerId: string;
  score: number;
};

export type RevealedSubmission = {
  submissionId: string;
  cardIds: string[];
  roomPlayerId: string | null;
};

export type GamePublicState = {
  gameSessionId: string;
  roundNumber: number;
  phase: GamePhase;
  czarPlayerId: string;
  blackCard: BlackCardInfo;
  scores: PlayerScore[];
  totalSubmissions: number;
  expectedSubmissions: number;
  submissions: RevealedSubmission[];
  winningPlayerId: string | null;
};

export type GamePrivateState = {
  gameSessionId: string;
  myHand: string[];
  hasSubmitted: boolean;
};

export type WhiteCard = {
  id: string;
  text: string;
};
